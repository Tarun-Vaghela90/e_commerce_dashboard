const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  
  stockCount: {
    type: Number,
    required: true,
    min: 0
  },
  status:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);