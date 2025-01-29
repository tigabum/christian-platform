import express, { Response, Request } from "express";
import { AuthRequest } from "../middleware/auth";
import { auth } from "../middleware/auth";
import Question from "../models/Question";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

const router = express.Router();

// Create a question
router.post(
  "/",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, content, isPublic = true, isAnonymous = false } = req.body;
      const question = new Question({
        title,
        content,
        asker: req.user?.userId,
        isPublic,
        isAnonymous,
        status: "pending",
      });
      await question.save();
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all public questions
router.get("/public", async (_req, res: Response): Promise<void> => {
  try {
    const questions = await Question.find({ isPublic: true })
      .populate("asker", "name")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's questions with search and filter
router.get(
  "/my",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, status } = req.query;
      let query: any = {}; // Remove asker filter temporarily

      // Add status filter if provided and not 'all'
      if (status && status !== "all") {
        query.status = status;
      }

      const questions = await Question.find(query)
        .populate("responder", "name")
        .sort({ createdAt: -1 });

      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get question by ID
router.get(
  "/:id",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const question = await Question.findById(req.params.id)
        .populate("asker", "name")
        .populate("responder", "name");

      if (!question) {
        res.status(404).json({ message: "Question not found" });
        return;
      }

      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get responder's questions
router.get(
  "/responder",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      let query: any = {
        $or: [
          { responder: req.user?.userId }, // Questions assigned to this responder
          {
            status: "pending", // Or pending questions that need a responder
            responder: { $exists: false },
          },
        ],
      };

      if (status && status !== "all") {
        query.status = status;
      }

      const questions = await Question.find(query)
        .populate("asker", "name")
        .sort({ createdAt: -1 });

      res.json(questions);
    } catch (error) {
      console.error("Error fetching responder questions:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Add new route specifically for responders
router.get(
  "/responder/questions", // New separate endpoint for responders
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      let query: any = {
        $or: [
          { responder: req.user?.userId }, // Questions assigned to this responder
          {
            status: "pending", // Or pending questions that need a responder
            responder: { $exists: false },
          },
        ],
      };

      if (status && status !== "all") {
        query.status = status;
      }

      const questions = await Question.find(query)
        .populate("asker", "name")
        .sort({ createdAt: -1 });

      res.json(questions);
    } catch (error) {
      console.error("Error fetching responder questions:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
