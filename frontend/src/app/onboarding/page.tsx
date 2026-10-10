'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
}

export default function OnboardingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Lấy danh sách task từ backend
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/onboarding/my-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách task:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Khởi tạo task mẫu
  const handleSeedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/onboarding/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setMessage('Đã khởi tạo danh sách task mẫu thành công!');
      }
    } catch (err) {
      console.error('Lỗi seed task:', err);
    }
  };

  // Đánh dấu hoàn thành / chưa hoàn thành task
  const handleToggleTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/onboarding/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t)),
        );
        if (updatedTask.isCompleted && updatedTask.title.includes('Nhận tài khoản')) {
          setMessage('🎉 Đã hoàn thành task "Nhận tài khoản"! Workflow n8n IT Provisioning đã được kích hoạt.');
        }
      }
    } catch (err) {
      console.error('Lỗi cập nhật task:', err);
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Nút Quay lại Dashboard */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
      </Link>

      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">📋 Onboarding Checklist</h1>
        <p className="text-gray-600">Danh sách công việc cần hoàn thành cho nhân viên mới</p>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Thanh tiến độ */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Tiến độ hoàn thành: {completedCount}/{tasks.length} tasks</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Nút Khởi tạo Task mẫu nếu danh sách trống */}
      {tasks.length === 0 && !loading && (
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500 mb-4">Bạn chưa có task onboarding nào.</p>
          <button
            onClick={handleSeedTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Tạo danh sách task mẫu
          </button>
        </div>
      )}

      {/* Danh sách Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggleTask(task.id)}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              task.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => {}} // Xử lý qua onClick của div
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <h3 className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                task.isCompleted ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {task.isCompleted ? 'Đã xong' : 'Chờ xử lý'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
