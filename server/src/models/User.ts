import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "asker" | "responder" | "admin";
  isPublic: boolean;
  createdAt: Date;
  expertise: string[];
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "responder", "admin"],
    default: "user",
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expertise: [
    {
      type: String,
      enum: [
        "Technology",
        "Health",
        "Education",
        "Business",
        "Lifestyle",
        // Add more categories as needed
      ],
    },
  ],
});

export default mongoose.model<IUser>("User", userSchema);
