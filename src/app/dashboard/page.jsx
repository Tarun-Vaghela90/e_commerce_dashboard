'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import socket from '../socket/socket';
import { Row, Col } from 'react-bootstrap';
export default function Page() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
  fetchProducts();

  const token = localStorage.getItem('authToken');
  let userId = null;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      userId = decoded?.id;
    } catch (err) {
      console.error("Invalid token format:", err.message);
    }
  }

  if (userId) {
    socket.emit('user-connected', userId);
  }

  socket.on('product-added', (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  });

  socket.on('product-updated', (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
    );
  });

  socket.on('product-deleted', (deletedId) => {
    setProducts(prev => prev.filter(p => p._id !== deletedId));
  });

  return () => {
    socket.off('product-added');
    socket.off('product-updated');
    socket.off('product-deleted');
  };
}, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products/api/viewProducts');
      setProducts(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };


return (
  <>
    <div className="p-4">
      <h2 className="text-center mb-4 fw-bold fs-2">Products</h2>
    </div>
    <div className="container">
      <Row className="g-4 justify-content-center">
        {products.map((product) => (
          <Col key={product._id} xs={12} sm={6} md={4}>
            <Card style={{ width: '100%' }} className="shadow">
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted d-flex">{product.category}</Card.Subtitle>
               <div className="d-flex flex-row gap-4 ">
                <div><strong>Price:</strong> ₹{product.price}</div>
                <div><strong>Stock:</strong> {product.stockCount}</div>
              </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: product.status === 'In Stock' ? 'green' : 'red' }}>
                    {product.status}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  </>
);

}
