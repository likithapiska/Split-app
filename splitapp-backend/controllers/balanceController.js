import Expense from "../models/Expense.js";

export const getGroupBalance = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const expenses = await Expense.find({ groupId });

    let balances = {};

    expenses.forEach(exp => {
      const { paidBy, amount, splits } = exp;

      // payer gets full amount
      if (!balances[paidBy]) balances[paidBy] = 0;
      balances[paidBy] += amount;

      // each member owes
      splits.forEach(s => {
        if (!balances[s.userId]) balances[s.userId] = 0;
        balances[s.userId] -= s.amount;
      });
    });

    res.json(balances);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};