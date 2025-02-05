import mongoose, { Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  content: string;
  asker: mongoose.Types.ObjectId;
  responder?: mongoose.Types.ObjectId;
  status: "pending" | "assigned" | "inProgress" | "answered" | "closed";
  isPublic: boolean;
  isAnonymous: boolean;
  answer?: {
    content: string;
    createdAt: Date;
  };
  assignedAt: Date;
  answeredAt: Date;
  createdAt: Date;
}

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    asker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "inProgress", "answered", "closed"],
      default: "pending",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    answer: {
      content: String,
      createdAt: Date,
    },
    assignedAt: {
      type: Date,
    },
    answeredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
