import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import type { Habit } from '../../types';

export default function HabitManagementPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { habits } = state;

  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '✨',
    type: 'reward' as 'reward' | 'punish',
    points: 10,
  });

  const rewardHabits = habits.filter((h) => h.type === 'reward');
  const punishHabits = habits.filter((h) => h.type === 'punish');

  const openAddModal = (type: 'reward' | 'punish') => {
    setEditingHabit(null);
    setFormData({ name: '', emoji: '✨', type, points: 10 });
    setShowModal(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      emoji: habit.emoji,
      type: habit.type,
      points: habit.points,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingHabit) {
      dispatch({
        type: 'UPDATE_HABIT',
        payload: { ...editingHabit, ...formData },
      });
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        ...formData,
        order: habits.length,
        userId: 'local',
        createdAt: new Date(),
      };
      dispatch({ type: 'ADD_HABIT', payload: newHabit });
    }

    setShowModal(false);
    setEditingHabit(null);
  };

  const handleDelete = (habitId: string) => {
    if (!confirm('确定删除此习惯？')) return;
    dispatch({ type: 'DELETE_HABIT', payload: habitId });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/settings')} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">习惯管理</h1>
        <div className="w-8"></div>
      </div>

      {/* 奖励习惯 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🌟 奖励习惯
          </h2>
          <button
            onClick={() => openAddModal('reward')}
            className="px-4 py-2 bg-[#3ECA6A] text-white rounded-lg font-medium"
          >
            + 添加
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {rewardHabits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <div>
                  <div className="font-medium">{habit.name}</div>
                  <div className="text-sm text-[#3ECA6A]">+{habit.points} 积分</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(habit)}
                  className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {rewardHabits.length === 0 && (
            <div className="p-8 text-center text-gray-400">暂无奖励习惯</div>
          )}
        </div>
      </div>

      {/* 惩罚习惯 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            ⚠️ 惩罚习惯
          </h2>
          <button
            onClick={() => openAddModal('punish')}
            className="px-4 py-2 bg-[#FF5757] text-white rounded-lg font-medium"
          >
            + 添加
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {punishHabits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <div>
                  <div className="font-medium">{habit.name}</div>
                  <div className="text-sm text-[#FF5757]">-{habit.points} 积分</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(habit)}
                  className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {punishHabits.length === 0 && (
            <div className="p-8 text-center text-gray-400">暂无惩罚习惯</div>
          )}
        </div>
      </div>

      {/* 添加/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingHabit ? '编辑习惯' : '添加习惯'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">emoji</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">积分</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
