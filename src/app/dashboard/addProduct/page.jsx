'use client'

import React, { useState } from 'react';
import {toast}  from 'react-toastify'
import { useRouter } from 'next/navigation';

export default function Page() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stockCount: '',
    status: 'In Stock',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    const token  = localStorage.getItem("authToken")
    try {
      const res = await fetch('http://localhost:5000/products/api/addproduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          authtoken:token,
         },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        toast.success('Product added successfully!');
        
        setFormData({
          name: '',
          category: '',
          price: '',
          stockCount: '',
          status: 'In Stock',
        });

      } else {
        toast.warn(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.info('Server error');
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Product Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <input
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Price (₹)</label>
          <input
  name="price"
  type="text"
  value={formData.price}
  onChange={(e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    handleChange({ target: { name: 'price', value: onlyNums } });
  }}
  className="w-full border px-3 py-2 rounded-md"
  required
/>

        </div>

        <div>
          <label className="block mb-1 font-medium">Stock Count</label>
         <input
  name="stockCount"
  type="text"
  value={formData.stockCount}
  onChange={(e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, '');
    handleChange({ target: { name: 'stockCount', value: onlyDigits } });
  }}
  className="w-full border px-3 py-2 rounded-md"
  required
/>

        </div>

        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="In Stock">In Stock</option>
            <option value="Out Stock">Out Stock</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
