
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

import balanceRoutes from "./routes/balanceRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Split App Backend Running");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);

app.use("/api/expenses", expenseRoutes);
app.use("/api/balance", balanceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});