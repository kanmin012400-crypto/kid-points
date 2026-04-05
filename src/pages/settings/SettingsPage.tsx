import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { userData, settings } = state;

  const [isEditingChild, setIsEditingChild] = useState(false);
  const [childInfo, setChildInfo] = useState({
    name: userData?.child?.name || '',
    avatarEmoji: userData?.child?.avatarEmoji || '👶',
    birthday: userData?.child?.birthday || '',
  });

  const [newParentName, setNewParentName] = useState('');
  const [showAddParent, setShowAddParent] = useState(false);

  const handleSaveChild = () => {
    dispatch({ type: 'UPDATE_CHILD', payload: childInfo });
    setIsEditingChild(false);
  };

  const handleAddParent = () => {
    if (!newParentName.trim()) return;
    dispatch({ type: 'ADD_PARENT', payload: newParentName.trim() });
    setNewParentName('');
    setShowAddParent(false);
  };

  const handleDeleteParent = (name: string) => {
    if (!confirm(`确定删除家长"${name}"？`)) return;
    dispatch({ type: 'DELETE_PARENT', payload: name });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">设置</h1>

      {/* 孩子信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">孩子信息</h2>
          <button
            onClick={() => setIsEditingChild(!isEditingChild)}
            className="text-[#7C6FFF] font-medium"
          >
            {isEditingChild ? '取消' : '编辑'}
          </button>
        </div>

        {isEditingChild ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">头像 emoji</label>
              <input
                type="text"
                value={childInfo.avatarEmoji}
                onChange={(e) => setChildInfo({ ...childInfo, avatarEmoji: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">姓名</label>
              <input
                type="text"
                value={childInfo.name}
                onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">生日</label>
              <input
                type="date"
                value={childInfo.birthday}
                onChange={(e) => setChildInfo({ ...childInfo, birthday: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              />
            </div>
            <button
              onClick={handleSaveChild}
              className="w-full py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold"
            >
              保存
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-5xl">{userData?.child?.avatarEmoji || '👶'}</span>
            <div>
              <div className="font-semibold text-lg">{userData?.child?.name || '未设置'}</div>
              <div className="text-gray-500 text-sm">{userData?.child?.birthday || '未设置生日'}</div>
            </div>
          </div>
        )}
      </div>

      {/* 家长成员 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">家长成员</h2>
          <button
            onClick={() => setShowAddParent(!showAddParent)}
            className="text-[#7C6FFF] font-medium"
          >
            {showAddParent ? '取消' : '+ 添加'}
          </button>
        </div>

        {showAddParent && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newParentName}
              onChange={(e) => setNewParentName(e.target.value)}
              placeholder="家长姓名"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddParent()}
            />
            <button
              onClick={handleAddParent}
              className="px-4 py-2 bg-[#7C6FFF] text-white rounded-lg"
            >
              添加
            </button>
          </div>
        )}

        <div className="space-y-2">
          {userData?.parents?.map((parent) => (
            <div key={parent.name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <span>{parent.name}</span>
              </div>
              <button
                onClick={() => handleDeleteParent(parent.name)}
                className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Link
          to="/settings/habits"
          className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <span className="font-medium">习惯管理</span>
          </div>
          <span className="text-gray-400">›</span>
        </Link>
        <Link
          to="/settings/gifts"
          className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <span className="font-medium">礼品管理</span>
          </div>
          <span className="text-gray-400">›</span>
        </Link>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <span className="font-medium">兑换比例</span>
          </div>
          <span className="text-gray-500">{settings.pointsPerYuan} 积分 = ¥1</span>
        </div>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <span className="font-medium">等级管理</span>
          </div>
          <span className="text-gray-400">›</span>
        </div>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <span className="font-medium">本地存储</span>
          </div>
          <span className="text-[#3ECA6A]">已保存</span>
        </div>
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📤</span>
            <span className="font-medium">导出数据</span>
          </div>
          <span className="text-gray-400">›</span>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-6">
        本地模式
      </div>
    </div>
  );
}
