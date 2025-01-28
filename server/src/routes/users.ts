import express, { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { auth } from "../middleware/auth";
import User from "../models/User";

const router = express.Router();

// Get all responders
router.get(
  "/responders",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    console.log("Hitting responders endpoint");
    try {
      const responders = await User.find({ role: "responder" }).select(
        "name role expertise"
      );
      console.log("Sending responders:", responders);
      res.json(responders);
    } catch (error) {
      console.error("Error fetching responders:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
