const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product');
// const categoryRoutes = require('./routes/category');
const userRoute = require("./routes/User")
const app = express();


try {
  mongoose.connect("mongodb://localhost:27017/e_commerce");
  console.log('✅ MongoDB Connected');
} catch (error) {
  console.error('❌ MongoDB connection failed:', error.message);
  // process.exit(1); // Exit the app if DB fails
}

app.use(cors());
app.use(express.json());
app.use('/products/api',productRoutes)
app.use('/users/api',userRoute)

    
const PORT =  5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));