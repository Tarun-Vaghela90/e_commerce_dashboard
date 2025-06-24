const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const User = require('../models/Users');
const fetchuser = require("../middleware/fetchuser");
const isAdmin = require("../middleware/isAdmin");

const JWT_SECRET = "tarun";

// =================== 🔐 Auth Routes ===================

// Register
router.post('/addUser', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Some fields are missing" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    const save = await user.save();

    const token = jwt.sign({ id: save._id, email: save.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ user: save, token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "User not created" });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Please enter both email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get logged-in user's data
router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// =================== 👤 User CRUD ===================

router.put('/updateUser/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =================== 🛡️ Admin Routes ===================

// Get all users
router.get('/admin/getallusers', fetchuser, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Promote user to admin
router.post('/admin/setadmin/:id', fetchuser, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ error: 'Could not update role' });
  }
});

// Enable/disable real-time updates for a user
router.post('/admin/set-realtime', fetchuser, isAdmin, async (req, res) => {
  const { userId, enabled } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { realtimeEnabled: enabled },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update realtime setting' });
  }
});

// Get details of connected users (only selected ones)
router.post('/admin/connected-users', fetchuser, isAdmin, async (req, res) => {
  const { userIds } = req.body;
  try {
    const users = await User.find(
      { _id: { $in: userIds } },
      '_id email realtimeEnabled'
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

module.exports = router;
