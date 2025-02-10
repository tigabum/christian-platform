import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

import authRoutes from "./routes/auth";
import questionRoutes from "./routes/questions";
import userRoutes from "./routes/users";
import responderRoutes from "./routes/responder";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/responder", responderRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
