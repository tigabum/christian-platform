import express, { Request, Response } from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import User from "../models/User";
import bcrypt from "bcryptjs";
import Question from "../models/Question";
import { Document } from "mongoose";

const router = express.Router();

interface PopulatedQuestion extends Document {
  title: string;
  asker: { name: string } | null;
  responder: { name: string } | null;
  status: string;
  createdAt: Date;
  answeredAt?: Date;
}

// Create new responder
router.post(
  "/responders",
  [
    auth,
    adminAuth,
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("expertise").notEmpty().withMessage("Expertise is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, expertise } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "Email already registered" });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create responder
      const responder = new User({
        name,
        email,
        password: hashedPassword,
        role: "responder",
        expertise,
      });

      await responder.save();

      res.status(201).json({
        message: "Responder created successfully",
        responder: {
          id: responder._id,
          name: responder.name,
          email: responder.email,
          expertise: responder.expertise,
        },
      });
    } catch (error) {
      console.error("Error creating responder:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all responders with optional filters
router.get(
  "/responders",
  [auth, adminAuth],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, expertise } = req.query;
      let query: any = { role: "responder" };

      // Add search filter if provided
      if (search && typeof search === "string") {
        const searchRegex = new RegExp(search, "i");
        query.$or = [{ name: searchRegex }, { email: searchRegex }];
      }

      // Add expertise filter if provided
      if (expertise) {
        query.expertise = expertise;
      }

      const responders = await User.find(query)
        .select("-password") // Exclude password
        .sort({ createdAt: -1 }); // Latest first

      res.json({
        count: responders.length,
        responders: responders.map((r) => ({
          id: r._id,
          name: r.name,
          email: r.email,
          expertise: r.expertise,
          createdAt: r.createdAt,
        })),
      });
    } catch (error) {
      console.error("Error fetching responders:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get single responder details
router.get(
  "/responders/:id",
  [auth, adminAuth],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const responder = await User.findOne({
        _id: req.params.id,
        role: "responder",
      }).select("-password");

      if (!responder) {
        res.status(404).json({ message: "Responder not found" });
        return;
      }

      res.json({
        id: responder._id,
        name: responder.name,
        email: responder.email,
        expertise: responder.expertise,
        createdAt: responder.createdAt,
      });
    } catch (error) {
      console.error("Error fetching responder:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update responder details
router.put(
  "/responders/:id",
  [
    auth,
    adminAuth,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email required"),
    body("expertise")
      .optional()
      .notEmpty()
      .withMessage("Expertise cannot be empty"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, expertise, password } = req.body;

      // Check if responder exists
      const responder = await User.findOne({
        _id: req.params.id,
        role: "responder",
      });

      if (!responder) {
        res.status(404).json({ message: "Responder not found" });
        return;
      }

      // Check email uniqueness if being updated
      if (email && email !== responder.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          res.status(400).json({ message: "Email already in use" });
          return;
        }
      }

      // Update fields if provided
      if (name) responder.name = name;
      if (email) responder.email = email;
      if (expertise) responder.expertise = expertise;

      // Update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        responder.password = await bcrypt.hash(password, salt);
      }

      await responder.save();

      res.json({
        message: "Responder updated successfully",
        responder: {
          id: responder._id,
          name: responder.name,
          email: responder.email,
          expertise: responder.expertise,
        },
      });
    } catch (error) {
      console.error("Error updating responder:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get dashboard statistics
router.get(
  "/dashboard/stats",
  [auth, adminAuth],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Get counts using Promise.all for better performance
      const [
        totalResponders,
        totalQuestions,
        answeredQuestions,
        pendingQuestions,
      ] = await Promise.all([
        User.countDocuments({ role: "responder" }),
        Question.countDocuments(),
        Question.countDocuments({ status: "answered" }),
        Question.countDocuments({ status: "pending" }),
      ]);

      // Calculate response rate
      const responseRate =
        totalQuestions > 0
          ? Math.round((answeredQuestions / totalQuestions) * 100)
          : 0;

      // Calculate average response time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const answeredQuestionsWithTime = await Question.find({
        status: "answered",
        answeredAt: { $exists: true },
        createdAt: { $gte: thirtyDaysAgo },
      }).select("createdAt answeredAt");

      let avgResponseTime = 0;
      if (answeredQuestionsWithTime.length > 0) {
        const totalResponseTime = answeredQuestionsWithTime.reduce((acc, q) => {
          return acc + (q.answeredAt.getTime() - q.createdAt.getTime());
        }, 0);
        avgResponseTime = Math.round(
          totalResponseTime /
            answeredQuestionsWithTime.length /
            (1000 * 60 * 60)
        ); // in hours
      }

      res.json({
        responders: {
          total: totalResponders,
        },
        questions: {
          total: totalQuestions,
          answered: answeredQuestions,
          pending: pendingQuestions,
          responseRate: responseRate,
        },
        performance: {
          avgResponseTime: avgResponseTime, // in hours
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get recent activities
router.get(
  "/dashboard/activities",
  [auth, adminAuth],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Get recent questions and their answers
      const recentActivities = (await Question.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("asker", "name")
        .populate("responder", "name")
        .select(
          "title status createdAt answeredAt responder asker"
        )) as PopulatedQuestion[];

      const activities = recentActivities.map((q) => ({
        id: q._id,
        type: q.status === "answered" ? "answer" : "question",
        title: q.title,
        asker: q.asker?.name || "Anonymous",
        responder: q.responder?.name,
        timestamp: q.status === "answered" ? q.answeredAt : q.createdAt,
        status: q.status,
      }));

      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
