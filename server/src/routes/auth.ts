import express from "express";
import { register, login } from "../controller/authController";
import { body } from "express-validator";
import { Request, Response } from "express";
import User from "../models/User";
import { auth } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["asker", "responder"]).withMessage("Invalid role"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login
);

router.get(
  "/me",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user?.userId).select("-password");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
