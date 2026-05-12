import Group from "../models/Group.js";

// CREATE GROUP
export const createGroup = async (req, res) => {
  try {
    const group = await Group.create({
      name: req.body.name,
      members: req.body.members,
      createdBy: req.user._id
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET GROUPS
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      "members.userId": req.user._id
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};