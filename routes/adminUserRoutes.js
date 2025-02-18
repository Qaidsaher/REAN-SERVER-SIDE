const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

// GET all users (investors and innovators)
router.get("/", getAllUsers);

// GET a single user by ID (pass ?userType=investor or ?userType=innovator)
router.get("/:id", getUserById);

// POST to create a new user (include "userType" in the request body)
router.post("/", createUser);

// PUT to update a user (include "userType" in the request body)
router.put("/:id", updateUser);

// DELETE a user (pass ?userType=investor or ?userType=innovator)
router.delete("/:id", deleteUser);

module.exports = router;
