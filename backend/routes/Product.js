const express = require('express');
const router = express.Router();
const Product = require('../models/Products');


router.get("/viewProducts",  async (req, res) => {
  try {
    // Find product for the user
    const products = await Product.find();

    res.json(products); // ✅ use the correct variable

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occurred");
  }
});

router.post('/addproduct', async (req,res) =>{
try{
const {name,category,price,stockCount,status} = req.body;

if (!name || !category || !price || !stockCount || !status) {
    return res.status(400).json({ error: "Some fields are missing" });
}


const product = new Product({
    name,
    category,
    price: parseFloat(price),
    stockCount: parseInt(stockCount),
    status
});

const save = await product.save();
res.status(201).json(save); 

}catch(err){
console.log(err)
res.status(400).json({error:"product not  saved"})
}
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;