import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["answer", "login", "status_change"],
  },
  title: { type: String, required: true },
  asker: { type: String, required: true },
  responderId: { type: String },
  responder: { type: String },
  timestamp: { type: Date, default: Date.now },
  status: { type: String },
});

export default mongoose.model("Activity", activitySchema);
