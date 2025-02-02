import express, { Response } from "express";
import { auth } from "../middleware/auth";
import Question from "../models/Question";
import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

// Get responder's questions
router.get(
  "/questions",
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

// Start answering a question
router.patch(
  "/questions/:id/start",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const question = await Question.findById(req.params.id);

      if (!question) {
        res.status(404).json({ message: "Question not found" });
        return;
      }

      if (question.status !== "pending") {
        res.status(400).json({ message: "Question is not pending" });
        return;
      }

      question.status = "assigned";
      question.responder = new mongoose.Types.ObjectId(req.user?.userId);
      question.assignedAt = new Date();
      await question.save();

      res.json(question);
    } catch (error) {
      console.error("Error starting question:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Submit answer for a question
router.post(
  "/questions/:id/answer",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { answer } = req.body;

      if (!answer?.trim()) {
        res.status(400).json({ message: "Answer is required" });
        return;
      }

      const question = await Question.findById(req.params.id);

      if (!question) {
        res.status(404).json({ message: "Question not found" });
        return;
      }

      if (question.status === "answered") {
        res.status(400).json({ message: "Question is already answered" });
        return;
      }

      if (question.responder?.toString() !== req.user?.userId) {
        res
          .status(403)
          .json({ message: "Not authorized to answer this question" });
        return;
      }

      question.answer = {
        content: answer.trim(),
        createdAt: new Date(),
      };
      question.status = "answered";
      question.answeredAt = new Date();
      await question.save();

      res.json(question);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
