'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✅ Import
import { toast } from 'react-toastify';

export default function DashboardLayout({ children }) {
  const router = useRouter(); // ✅ Define router

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login'); // ✅ Now this works
    toast.success('Logged out successfully');
  };

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='w-64 bg-gray-100 border-r p-4 space-y-4'>
        <h2 className='text-xl font-bold mb-4 text-decoration-none'>Dashboard</h2>
        <Link href="/dashboard" className="block text-decoration-none">🏠 Home</Link>
        <Link href="/dashboard/producthome" className="block text-decoration-none">📦 Products</Link>
        <Link href="/dashboard/addProduct" className="block text-decoration-none">➕ Add Product</Link>
        <Link href="/dashboard/setting" className="block text-decoration-none"> ⚙️ Setting</Link>
        <span
          onClick={handleLogout}
          className="block text-decoration-none cursor-pointer text-red-600 hover:underline"
        >
          🚪 Log Out
        </span>
      </div>

      {/* Main Content */}
      <main className='flex-1 p-6'>
        {children}
      </main>
    </div>
  );
}
