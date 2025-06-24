'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = decoded?.id;

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/users/api/getuser', {
          headers: {
            'Content-Type': 'application/json',
            authToken: token,
          },
        });

        const data = await res.json();

        // Emit self connection regardless of admin
        const socket = io('http://localhost:5000', {
          auth: { token },
        });
        socketRef.current = socket;
        socket.emit('user-connected', currentUserId); // ✅ emit current user

        if (data.role === 'admin') {
          setIsAdmin(true);

          socket.on('connected-users', async (userIds) => {
            try {
              const res = await fetch('http://localhost:5000/users/api/admin/connected-users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  authToken: token,
                },
                body: JSON.stringify({ userIds }),
              });

              const data = await res.json();
              if (data.users) {
                setUsers(data.users);
              } else {
                toast.error('Failed to fetch user details');
              }
            } catch (err) {
              toast.error('Failed to fetch connected users');
            }
          });
        } else {
          toast.error("Access denied: You are not an admin");
        }
      } catch (err) {
        toast.error("Failed to verify user");
        console.error(err);
      }
    };

    fetchUser();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const handleToggle = async (userId, enabled) => {
    const token = localStorage.getItem('authToken');

    try {
      const res = await fetch('http://localhost:5000/users/api/admin/set-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authToken: token,
        },
        body: JSON.stringify({ userId, enabled }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, realtimeEnabled: enabled } : u
          )
        );
        toast.success(`Realtime ${enabled ? 'enabled' : 'disabled'} for user`);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-xl font-bold mb-4">🔌 Connected Users</h1>

      {!isAdmin ? (
        <p className="text-red-500">Only admins can view this page.</p>
      ) : users.length === 0 ? (
        <p>No users currently connected.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between bg-gray-100 p-3 rounded"
            >
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-600">
                  Realtime: {user.realtimeEnabled ? '✅ Enabled' : '❌ Disabled'}
                </p>
              </div>
              <button
                onClick={() => handleToggle(user._id, !user.realtimeEnabled)}
                className={`px-3 py-1 rounded text-white ${
                  user.realtimeEnabled ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                {user.realtimeEnabled ? 'Disable' : 'Enable'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
