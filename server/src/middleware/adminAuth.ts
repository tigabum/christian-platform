import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import User from "../models/User";

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("AdminAuth - userId:", req.user?.userId); // Debug log
    const user = await User.findById(req.user?.userId);
    console.log("AdminAuth - found user:", user); // Debug log

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ message: "Admin access required" });
      return;
    }
    next();
  } catch (error: any) {
    console.error("AdminAuth error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};
