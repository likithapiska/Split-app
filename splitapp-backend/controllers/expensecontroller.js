import Expense from "../models/Expense.js";
import Group from "../models/Group.js";

// =======================
// ADD EXPENSE
// =======================
export const addExpense = async (req, res) => {
  try {
    const { groupId, title, amount, paidBy, members } = req.body;

    if (!groupId || !title || !amount || !paidBy || !members) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const splitAmount = amount / members.length;

    const splits = members.map((userId) => ({
      userId,
      amount: splitAmount,
    }));

    const expense = await Expense.create({
      groupId,
      title,
      amount,
      paidBy,
      splits,
    });

    res.status(201).json(expense);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// GET EXPENSES BY GROUP
// =======================
export const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ groupId });

    res.json(expenses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =======================
// GET BALANCE
// =======================

   

export const getBalance = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    const expenses = await Expense.find({ groupId });

    const balance = {};

    // initialize all members to 0
    group.members.forEach((m) => {
      const id = m.userId?._id || m.userId;
      balance[id] = 0;
    });

    // calculate balance
    expenses.forEach((exp) => {
      const payer = exp.paidBy;

      balance[payer] =
        (balance[payer] || 0) + exp.amount;

      exp.splits.forEach((split) => {
        balance[split.userId] =
          (balance[split.userId] || 0) - split.amount;
      });
    });

    res.json(balance);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}; 

// =======================
// DELETE EXPENSE (NEW FEATURE)
// =======================
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      message: "Expense deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};