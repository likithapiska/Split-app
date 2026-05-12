import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    title: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paidBy: {
      type: String,
    },

    splits: [
      {
        userId: {
          type: String,
        },

        amount: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);