import express, { Request, Response } from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import User from "../models/User";
import bcrypt from "bcryptjs";
import Question from "../models/Question";
import { Document } from "mongoose";
import Activity from "../models/Activity";
// import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();

interface PopulatedQuestion extends Document {
  title: string;
  asker: { name: string } | null;
  responder: { name: string } | null;
  status: string;
  createdAt: Date;
  answeredAt?: Date;
}

// Use both middlewares in this order
router.use(auth); // First verify the token and set req.user
router.use(adminAuth); // Then verify if the user is an admin

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
      const stats = {
        totalResponders: await User.countDocuments({ role: "responder" }),
        totalQuestions: await Question.countDocuments(),
        answeredQuestions: await Question.countDocuments({
          status: "answered",
        }),
        responseRate: 0, // Calculate based on answered/total
      };

      if (stats.totalQuestions > 0) {
        stats.responseRate =
          (stats.answeredQuestions / stats.totalQuestions) * 100;
      }

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  }
);

// Get recent activities
router.get(
  "/dashboard/activities",
  [auth, adminAuth],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const activities = await Activity.find()
        .sort({ createdAt: -1 })
        .limit(10);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  }
);

export default router;
