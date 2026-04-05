import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import type { Gift } from '../../types';

export default function GiftManagementPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { gifts, settings } = state;

  const [showModal, setShowModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎁',
    type: 'physical' as 'physical' | 'privilege',
    priceYuan: 0,
    points: 0,
  });
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | undefined>();

  const openAddModal = () => {
    setEditingGift(null);
    setFormData({
      name: '',
      emoji: '🎁',
      type: 'physical',
      priceYuan: 0,
      points: 0,
    });
    setExistingPhotoUrl(undefined);
    setShowModal(true);
  };

  const openEditModal = (gift: Gift) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      emoji: gift.emoji || '🎁',
      type: gift.type,
      priceYuan: gift.priceYuan || 0,
      points: gift.points,
    });
    setExistingPhotoUrl(gift.photoUrl);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    const points = formData.type === 'physical'
      ? Math.round((formData.priceYuan || 0) * settings.pointsPerYuan)
      : formData.points;

    const photoUrl = existingPhotoUrl;

    if (editingGift) {
      dispatch({
        type: 'UPDATE_GIFT',
        payload: { ...editingGift, ...formData, points, photoUrl },
      });
    } else {
      const newGift: Gift = {
        id: Date.now().toString(),
        name: formData.name,
        emoji: formData.emoji,
        type: formData.type,
        priceYuan: formData.type === 'physical' ? formData.priceYuan : undefined,
        points,
        photoUrl,
        order: gifts.length,
        userId: 'local',
        createdAt: new Date(),
      };
      dispatch({ type: 'ADD_GIFT', payload: newGift });
    }

    setShowModal(false);
    setEditingGift(null);
  };

  const handleDelete = (giftId: string) => {
    if (!confirm('确定删除此礼品？')) return;
    dispatch({ type: 'DELETE_GIFT', payload: giftId });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/settings')} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">礼品管理</h1>
        <button onClick={openAddModal} className="px-4 py-2 bg-[#7C6FFF] text-white rounded-lg font-medium">
          + 添加
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {gifts.map((gift) => (
          <div key={gift.id} className="flex items-center gap-4 p-4 border-b last:border-0">
            {gift.photoUrl ? (
              <img src={gift.photoUrl} alt={gift.name} className="w-16 h-16 object-cover rounded-xl" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                {gift.emoji || '🎁'}
              </div>
            )}
            <div className="flex-1">
              <div className="font-medium">{gift.name}</div>
              <div className="text-sm text-gray-500">
                {gift.type === 'physical' ? '🎁 实物' : '⭐ 特权'} · {gift.points} 积分
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(gift)}
                className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(gift.id)}
                className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {gifts.length === 0 && (
          <div className="p-8 text-center text-gray-400">暂无礼品</div>
        )}
      </div>

      {/* 添加/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingGift ? '编辑礼品' : '添加礼品'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">礼品图片</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full"
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
                <label className="block text-sm text-gray-500 mb-1">emoji</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">类型</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, type: 'physical' })}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      formData.type === 'physical'
                        ? 'bg-[#7C6FFF] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🎁 实物
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'privilege' })}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      formData.type === 'privilege'
                        ? 'bg-[#7C6FFF] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    ⭐ 特权
                  </button>
                </div>
              </div>

              {formData.type === 'physical' && (
                <div>
                  <label className="block text-sm text-gray-500 mb-1">金额（元）</label>
                  <input
                    type="number"
                    value={formData.priceYuan || ''}
                    onChange={(e) => setFormData({ ...formData, priceYuan: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    积分: {Math.round((formData.priceYuan || 0) * settings.pointsPerYuan)}
                  </div>
                </div>
              )}

              {formData.type === 'privilege' && (
                <div>
                  <label className="block text-sm text-gray-500 mb-1">积分</label>
                  <input
                    type="number"
                    value={formData.points || ''}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                  />
                </div>
              )}
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
