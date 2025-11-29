'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLoginModalProps {
  onClose: () => void;
}

export default function AdminLoginModal({ onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password (in production, this should be more secure)
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password';
    
    if (password === correctPassword) {
      router.push('/admin');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`Sai mật khẩu! Còn ${3 - newAttempts} lần thử.`);
      
      if (newAttempts >= 3) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Đăng nhập quản trị</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
              Mật khẩu:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Nhập mật khẩu"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={attempts >= 3}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}