'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import socket from '../../socket/socket'
import {toast} from 'react-toastify'
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
const [selectedIds, setSelectedIds] = useState([]);

useEffect(() => {
  fetchProducts();

  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('authToken not found in localStorage');
    toast.danger("authToken not found in localStorage")
    return;
  }

  let currentUserId = null;

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    currentUserId = decoded.id;
  } catch (err) {
    console.error('Failed to decode token:', err.message);
    return;
  }

  // Socket event listeners (scoped inside only if token is valid)
  socket.on('product-added', (newProduct) => {
    if (newProduct.user === currentUserId) {
      setProducts(prev => [newProduct, ...prev]);
    }
  });

  socket.on('product-updated', (updatedProduct) => {
    if (updatedProduct.user === currentUserId) {
      setProducts(prev =>
        prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
      );
    }
  });

  socket.on('product-deleted', (deletedId) => {
    setProducts(prev => prev.filter(p => p._id !== deletedId));
  });

  // Clean up on unmount
  return () => {
    socket.off('product-added');
    socket.off('product-updated');
    socket.off('product-deleted');
  };
}, []);



  const fetchProducts = async () => {
    try {
     const token = localStorage.getItem('authToken'); 

    const res = await axios.get('http://localhost:5000/products/api/myproducts', {
    headers: {
      authtoken: token 
    }
  });

setProducts(res.data);

   

    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
  try {
    const token = localStorage.getItem('authToken'); 

    await axios.delete(`http://localhost:5000/products/api/${id}`, {
      headers: {
        authtoken: token
      }
    });

    

  } catch (err) {
    console.error('Delete failed', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
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
// update product
  const handleFormSubmit = async (e) => {
  e.preventDefault();
  if (!selectedProduct) return;

  try {
    const token = localStorage.getItem('authToken');

    await axios.put(
      `http://localhost:5000/products/api/${selectedProduct._id}`,
      formData,
      {
        headers: {
          authtoken: token,
        },
      }
    );

    setShowModal(false);
  } catch (err) {
    console.error("Update failed", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
  }
};
const handleBulkDelete = async () => {
  if (!window.confirm("Are you sure you want to delete selected products?")) return;

  try {
    const token = localStorage.getItem('authToken');

    await axios.post('http://localhost:5000/products/api/delete-multiple', {
      ids: selectedIds,
    }, {
      headers: {
        authtoken: token
      }
    });

    // Clear selected and let socket handle state update
    setSelectedIds([]);
  } catch (err) {
    console.error('Bulk delete failed', err.response?.data || err.message);
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
    <option value="technology">Technology</option>
    <option value="clothes">clothes</option>
    <option value="home">Home</option>
  </select>

  {/* Filter by Stock */}
  <select className="form-select w-auto" onChange={(e) => setFilterStock(e.target.value)}>
    <option value="">All Stock</option>
    <option value="in">In Stock</option>
    <option value="out">Out of Stock</option>
  </select>
</div>

    </div>
    <div className="d-flex justify-content-between align-items-center mb-3">
  <Button
    variant="danger"
    disabled={selectedIds.length === 0}
    onClick={handleBulkDelete}
  >
    Delete Selected ({selectedIds.length})
  </Button>
</div>
      <div className="d-flex flex-wrap gap-6 justify-content-center">
        {filteredProducts.map((product) => (
          <Card key={product._id} style={{ width: '18rem' }} className="shadow">
            <Card.Body>
              <Card.Title>
                <input
    type="checkbox"
    className="form-check-input me-2"
    checked={selectedIds.includes(product._id)}
    onChange={() => {
      setSelectedIds(prev =>
        prev.includes(product._id)
          ? prev.filter(id => id !== product._id)
          : [...prev, product._id]
      );
    }}
  />
                {product.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{product.category}</Card.Subtitle>
              <div className="d-flex flex-row gap-4 ">
                <div><strong>Price:</strong> ₹{product.price}</div>
                <div><strong>Stock:</strong> {product.stockCount}</div>
              </div>
                <div><strong>Status:</strong>
         <p className={product.status.trim() === 'In Stock' ? 'text-success' : 'text-danger'}>
  {product.status}
</p>



                
                </div>
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
