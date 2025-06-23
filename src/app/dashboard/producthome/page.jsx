'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function ProductHome() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stockCount: '',
    status: 'In Stock',
  });
const [sortBy, setSortBy] = useState('');
const [filterCategory, setFilterCategory] = useState('');
const [filterStock, setFilterStock] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products/api/viewProducts');
      setProducts(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/api/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed", err.response?.data || err.message);
    }
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stockCount: product.stockCount,
      status: product.status || 'In Stock',
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
const filteredProducts = products
  .filter(product => {
    // Category filter
    if (filterCategory && product.category !== filterCategory) return false;

    // Stock filter (status or stockCount)
    if (filterStock === 'in' && product.status !== 'In Stock') return false;
if (filterStock === 'out' && product.status !== 'Out Stock') return false;


    return true;
  })
  .sort((a, b) => {
    if (sortBy === 'low') return a.price - b.price;
    if (sortBy === 'high') return b.price - a.price;
    return 0;
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await axios.put(`http://localhost:5000/products/api/${selectedProduct._id}`, formData);
      fetchProducts(); // Refresh products
      setShowModal(false);
    } catch (err) {
      console.error("Update failed", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-center mb-4">Product List</h2>
{/* Filters and Sort */}
    <div className="d-flex flex-wrap gap-3 mb-4 justify-content-center">
      <div className="d-flex flex-wrap gap-3 mb-4 justify-content-center">
  {/* Sort by Price */}
  <select className="form-select w-auto" onChange={(e) => setSortBy(e.target.value)}>
    <option value="">Sort by Price</option>
    <option value="low">Low to High</option>
    <option value="high">High to Low</option>
  </select>

  {/* Filter by Category */}
  <select className="form-select w-auto" onChange={(e) => setFilterCategory(e.target.value)}>
    <option value="">All Categories</option>
    <option value="health">Health</option>
    <option value="dairy">Dairy</option>
  </select>

  {/* Filter by Stock */}
  <select className="form-select w-auto" onChange={(e) => setFilterStock(e.target.value)}>
    <option value="">All Stock</option>
    <option value="in">In Stock</option>
    <option value="out">Out of Stock</option>
  </select>
</div>

    </div>
      <div className="d-flex flex-wrap gap-6 justify-content-center">
        {filteredProducts.map((product) => (
          <Card key={product._id} style={{ width: '18rem' }} className="shadow">
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{product.category}</Card.Subtitle>
              <div className="d-flex flex-row gap-4">
                <div><strong>Price:</strong> ₹{product.price}</div>
                <div><strong>Stock:</strong> {product.stockCount}</div>
              </div>
                <div><strong>Status:</strong> {product.status}</div>
              <div className="d-flex justify-content-between mt-3">
                <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>Delete</Button>
                <Button variant="warning" size="sm" onClick={() => handleUpdate(product)}>Update</Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Update Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">Product Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <input name="category" type="text" value={formData.category} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Price (₹)</label>
              <input name="price" type="number" value={formData.price} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Stock Count</label>
              <input name="stockCount" type="number" value={formData.stockCount} onChange={handleChange} className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="In Stock">In Stock</option>
                <option value="Out Stock">Out Stock</option>
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
