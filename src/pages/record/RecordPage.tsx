import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { Habit } from '../../types';

type TabType = 'reward' | 'punish';

interface UndoToast {
  txId: string;
  habitId: string;
  habitName: string;
  points: number;
  timeout: ReturnType<typeof setTimeout>;
}

export default function RecordPage() {
  const { state, dispatch } = useApp();
  const { habits, userData } = state;
  const [activeTab, setActiveTab] = useState<TabType>('reward');
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [operator, setOperator] = useState(userData?.parents?.[0]?.name || '爸爸');
  const [note, setNote] = useState('');
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; points: number; x: number; y: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '✨', points: 10 });

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => h.type === activeTab);
  }, [habits, activeTab]);

  const handleRecord = useCallback((habit: Habit) => {
    setSelectedHabit(habit);
    setShowConfirmModal(true);
  }, []);

  const confirmRecord = () => {
    if (!selectedHabit) return;

    const points = activeTab === 'reward' ? selectedHabit.points : -selectedHabit.points;

    const tx = {
      id: Date.now().toString(),
      habitId: selectedHabit.id,
      habitName: selectedHabit.name,
      points,
      note: note || null,
      createdBy: operator,
      createdAt: new Date(),
      isReverted: false,
      userId: 'local',
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: tx });

    // 更新积分
    dispatch({
      type: 'UPDATE_CHILD',
      payload: { totalPoints: (userData?.child?.totalPoints || 0) + points },
    });

    // 清除之前的 undo toast
    if (undoToast) {
      clearTimeout(undoToast.timeout);
    }

    // 显示 undo toast
    const timeout = setTimeout(() => {
      setUndoToast(null);
    }, 5000);

    setUndoToast({
      txId: tx.id,
      habitId: selectedHabit.id,
      habitName: selectedHabit.name,
      points,
      timeout,
    });

    // 飘字动画
    setFloatingPoints({
      id: Date.now(),
      points,
      x: Math.random() * 100,
      y: 0,
    });
    setTimeout(() => setFloatingPoints(null), 1000);

    setShowConfirmModal(false);
    setSelectedHabit(null);
    setNote('');
  };

  const openAddModal = () => {
    setNewHabit({ name: '', emoji: '✨', points: 10 });
    setShowAddModal(true);
  };

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    dispatch({
      type: 'ADD_HABIT',
      payload: {
        id: Date.now().toString(),
        name: newHabit.name,
        emoji: newHabit.emoji,
        points: newHabit.points,
        type: activeTab,
        order: habits.length,
        userId: 'local',
        createdAt: new Date(),
      },
    });
    setShowAddModal(false);
  };

  const handleUndo = () => {
    if (!undoToast) return;
    clearTimeout(undoToast.timeout);

    // 撤销积分变化
    dispatch({
      type: 'UPDATE_CHILD',
      payload: { totalPoints: (userData?.child?.totalPoints || 0) - undoToast.points },
    });

    setUndoToast(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('reward')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'reward'
              ? 'bg-[#3ECA6A] text-white shadow-lg'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          🌟 奖励
        </button>
        <button
          onClick={() => setActiveTab('punish')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'punish'
              ? 'bg-[#FF5757] text-white shadow-lg'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          ⚠️ 惩罚
        </button>
      </div>

      {/* 习惯网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredHabits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => handleRecord(habit)}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <div className="text-4xl mb-2">{habit.emoji}</div>
            <div className="font-semibold text-[#08060d]">{habit.name}</div>
            <div className={`text-lg font-bold mt-1 ${activeTab === 'reward' ? 'text-[#3ECA6A]' : 'text-[#FF5757]'}`}>
              {activeTab === 'reward' ? '+' : ''}{habit.points}
            </div>
          </button>
        ))}
        {/* 新增卡片 */}
        <button
          onClick={openAddModal}
          className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 border-2 border-dashed flex flex-col items-center justify-center ${
            activeTab === 'reward'
              ? 'border-[#3ECA6A] text-[#3ECA6A] hover:bg-green-50'
              : 'border-[#FF5757] text-[#FF5757] hover:bg-red-50'
          }`}
        >
          <div className="text-4xl mb-2">+</div>
          <div className="font-semibold text-sm">新增{activeTab === 'reward' ? '奖励' : '惩罚'}</div>
        </button>
      </div>

      {filteredHabits.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-5xl mb-3">📝</div>
          <div>点击上方卡片添加{activeTab === 'reward' ? '奖励' : '惩罚'}习惯</div>
        </div>
      )}

      {/* 确认弹窗 */}
      {showConfirmModal && selectedHabit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">确认记录</h3>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{selectedHabit.emoji}</span>
              <div>
                <div className="text-lg font-semibold">{selectedHabit.name}</div>
                <div className={`text-2xl font-bold ${activeTab === 'reward' ? 'text-[#3ECA6A]' : 'text-[#FF5757]'}`}>
                  {activeTab === 'reward' ? '+' : ''}{selectedHabit.points} 积分
                </div>
              </div>
            </div>

            {/* 操作人选择 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2">操作人</label>
              <div className="flex gap-2">
                {userData?.parents?.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setOperator(p.name)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      operator === p.name
                        ? 'bg-[#7C6FFF] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 备注 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-2">备注（可选）</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold"
              >
                取消
              </button>
              <button
                onClick={confirmRecord}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增习惯弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              新增{activeTab === 'reward' ? '奖励' : '惩罚'}习惯
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Emoji</label>
                <input
                  type="text"
                  value={newHabit.emoji}
                  onChange={(e) => setNewHabit({ ...newHabit, emoji: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">名称</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="输入习惯名称..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">积分</label>
                <input
                  type="number"
                  value={newHabit.points}
                  onChange={(e) => setNewHabit({ ...newHabit, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddHabit}
                disabled={!newHabit.name}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-50 safe-area-bottom">
          <span>
            {undoToast.habitName} {undoToast.points > 0 ? '+' : ''}{undoToast.points}
          </span>
          <button
            onClick={handleUndo}
            className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            撤销
          </button>
        </div>
      )}

      {/* 飘字动画 */}
      {floatingPoints && (
        <div
          className="fixed pointer-events-none z-50 text-3xl font-bold animate-float-up"
          style={{
            left: `${floatingPoints.x}%`,
            top: '30%',
            color: floatingPoints.points > 0 ? '#3ECA6A' : '#FF5757',
          }}
        >
          {floatingPoints.points > 0 ? '+' : ''}{floatingPoints.points} ⭐
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-100px); }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
