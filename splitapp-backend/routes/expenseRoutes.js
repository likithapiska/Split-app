import express from "express";
import {
  addExpense,
  getExpenses,
  getBalance,
  deleteExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", addExpense);
router.get("/:groupId", getExpenses);
router.get("/balance/:groupId", getBalance);
router.delete("/:id", deleteExpense);

export default router;