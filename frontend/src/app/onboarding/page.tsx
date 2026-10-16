'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
}

export default function OnboardingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [seedLoading, setSeedLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({
          type: 'error',
          text: 'Bạn chưa đăng nhập! Vui lòng quay lại trang Login để đăng nhập.',
        });
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/onboarding/my-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else if (res.status === 401) {
        setMessage({
          type: 'error',
          text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
        });
      } else {
        setMessage({
          type: 'error',
          text: `Không thể tải danh sách task (Mã lỗi: ${res.status}).`,
        });
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách task:', err);
      setMessage({
        type: 'error',
        text: 'Không thể kết nối tới Backend Server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSeedTasks = async () => {
    try {
      setSeedLoading(true);
      setMessage(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage({
          type: 'error',
          text: 'Không tìm thấy Token đăng nhập!',
        });
        return;
      }

      const res = await fetch(`${API_URL}/onboarding/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setMessage({
          type: 'success',
          text: 'Đã khởi tạo danh sách task mẫu thành công!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Khởi tạo thất bại. Vui lòng thử lại.',
        });
      }
    } catch (err) {
      console.error('Lỗi seed task:', err);
      setMessage({
        type: 'error',
        text: 'Lỗi kết nối tới Backend.',
      });
    } finally {
      setSeedLoading(false);
    }
  };

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
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        if (updatedTask.isCompleted && updatedTask.title.includes('Nhận tài khoản')) {
          setMessage({
            type: 'success',
            text: '🎉 Đã hoàn thành task "Nhận tài khoản"! Hệ thống đã tự động cấp phát tài khoản và gửi email thông báo.',
          });
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
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>
        <Link href="/login" className="text-xs text-blue-600 hover:underline font-medium">
          Đăng nhập lại
        </Link>
      </div>

      <div className="border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Onboarding Checklist</h1>
          <p className="text-gray-600">Danh sách công việc cần hoàn thành cho nhân viên mới</p>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={fetchTasks}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

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

      {tasks.length === 0 && !loading && (
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500 mb-4">Bạn chưa có task onboarding nào.</p>
          <button
            onClick={handleSeedTasks}
            disabled={seedLoading}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {seedLoading ? 'Đang khởi tạo...' : 'Tạo danh sách task mẫu'}
          </button>
        </div>
      )}

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
                onChange={() => {}}
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
