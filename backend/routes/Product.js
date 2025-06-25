const express = require('express');
const router = express.Router();
const Product = require('../models/Products');
const User = require('../models/Users');
const fetchuser = require('../middleware/fetchuser');

// Get all products
router.get("/viewProducts", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occurred");
  }
});

// Get logged-in user's products
router.get('/myproducts', fetchuser, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add product
router.post('/addproduct', fetchuser, async (req, res) => {
  try {
    const { name, category, price, stockCount, status } = req.body;

    if (!name || !category || !price || !stockCount || !status) {
      return res.status(400).json({ error: "Some fields are missing" });
    }

    const product = new Product({
      user: req.user.id,
      name,
      category,
      price: parseFloat(price),
      stockCount: parseInt(stockCount),
      status
    });

    const savedProduct = await product.save();

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    for (const [userId, { socketId }] of connectedUsers.entries()) {
      const isOwner = userId === req.user.id;
      const user = await User.findById(userId);
      if (isOwner || user?.realtimeEnabled) {
        io.to(socketId).emit('product-added', savedProduct);
      }
    }

    res.status(201).json(savedProduct);

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Product not saved" });
  }
});

// Update product
router.put('/:id', fetchuser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    for (const [userId, { socketId }] of connectedUsers.entries()) {
      const isOwner = userId === req.user.id;
      const user = await User.findById(userId);
      if (isOwner || user?.realtimeEnabled) {
        io.to(socketId).emit('product-updated', updated);
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', fetchuser, async (req, res) => {
  try {
    
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Get socket.io and connected users map from app locals
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
console.log("Connected Users Map Keys:", [...connectedUsers.keys()]);

    // Notify product owner directly
    const ownerSocket = connectedUsers.get(req.user.id.toString()); // Force string key
    console.log("Owner Socket:", ownerSocket);

    if (ownerSocket?.socketId) {
      io.to(ownerSocket.socketId).emit('product-deleted', req.params.id);
    }

    // Optionally notify others with realtimeEnabled = true
    for (const [userId, { socketId }] of connectedUsers.entries()) {
      const userIdStr = userId.toString();
      const isOwner = userIdStr === req.user.id;

      // Skip owner (already notified above)
      if (isOwner) continue;

      const user = await User.findById(userIdStr);
      if (user?.realtimeEnabled && socketId) {
        io.to(socketId).emit('product-deleted', req.params.id);
      }
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete product


// Delete multiple products
router.post('/delete-multiple', fetchuser, async (req, res) => {
  const { ids } = req.body;
  try {
    await Product.deleteMany({ _id: { $in: ids } });

    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    for (const [userId, { socketId }] of connectedUsers.entries()) {
      const isOwner = userId === req.user.id;
      const user = await User.findById(userId);
      if (isOwner || user?.realtimeEnabled) {
        ids.forEach(id => io.to(socketId).emit('product-deleted', id));
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
