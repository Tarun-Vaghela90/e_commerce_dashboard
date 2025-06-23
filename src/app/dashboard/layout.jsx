'use client'
import Link from 'next/link'
import React from 'react'

export default function DashboardLayout({ children }) {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='w-64 bg-gray-100 border-r p-4 space-y-4'>
        <h2 className='text-xl font-bold mb-4 text-decoration-none'>Dashboard</h2>
        <Link href="/dashboard" className="block text-decoration-none">🏠 Home</Link>
        <Link href="/dashboard/producthome" className="block text-decoration-none">📦 Products</Link>
        <Link href="/dashboard/addProduct" className="block text-decoration-none">➕ Add Product</Link>
      </div>

      {/* Main Content */}
      <main className='flex-1 p-6'>
        {children}
      </main>
    </div>
  )
}
