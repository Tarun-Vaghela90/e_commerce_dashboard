const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/Users');
const fetchuser =  require("../middleware/fetchuser")
const JWT_SECRET = "tarun"; // 
const bcrypt = require('bcryptjs'); 

router.post('/addUser', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Some fields are missing" });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
const hashedPassword = await bcrypt.hash(password, 10); 

const user = new User({
  email,
  password: hashedPassword, // ✅ save hashed password
});

    const save = await user.save();

    const token = jwt.sign(
      { id: save._id, email: save.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ user: save, token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "User not created" });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email and password
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Example: Get logged-in user's details (protected route)
router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});


router.put('updateUser/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('delete/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;




