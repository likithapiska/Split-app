import express from "express";
import Group from "../models/Group.js";

const router = express.Router();


// ================= GET ALL GROUPS =================
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ADD USER =================

router.post("/:id/member", async (req, res) => {
  try {
    const { name } = req.body;

    console.log("ADD USER HIT:", req.params.id, name);

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // IMPORTANT FIX
    if (!Array.isArray(group.members)) {
      group.members = [];
    }

    const newMember = {
      userId: new Date().toString(),
      name: name.trim(),
    };

    group.members.push(newMember);

    await group.save();

    res.status(200).json(group);

  } catch (err) {
    console.log("🔥 ADD USER ERROR FULL:", err);
    res.status(500).json({
      message: err.message,
      error: err
    });
  }
});
  
// ================= EDIT USER =================
router.put("/:id/member", async (req, res) => {
  try {
    const { userId, name } = req.body;

    const group = await Group.findById(req.params.id);

    const member = group.members.find(
      (m) => String(m.userId) === String(userId)
    );

    if (member) {
      member.name = name;
    }

    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;