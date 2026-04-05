import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { Gift } from '../../types';

export default function GiftsPage() {
  const { state, dispatch } = useApp();
  const { userData, gifts, settings } = state;
  const totalPoints = userData?.child?.totalPoints || 0;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  // 新增礼品表单
  const [newGift, setNewGift] = useState({
    name: '',
    emoji: '🎁',
    type: 'physical' as 'physical' | 'privilege',
    priceYuan: 0,
    points: 0,
  });

  const handleRedeem = (gift: Gift) => {
    setSelectedGift(gift);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    if (!selectedGift) return;

    // 检查积分是否足够
    if (totalPoints < selectedGift.points) {
      alert('积分不足');
      return;
    }

    // 创建兑换记录
    const redemptionTx = {
      id: Date.now().toString(),
      habitId: selectedGift.id,
      habitName: `兑换: ${selectedGift.name}`,
      points: -selectedGift.points,
      note: null,
      createdBy: '兑换',
      createdAt: new Date(),
      isReverted: false,
      userId: 'local',
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: redemptionTx });

    // 扣减积分
    dispatch({
      type: 'UPDATE_CHILD',
      payload: { totalPoints: totalPoints - selectedGift.points },
    });

    setShowRedeemModal(false);
    setSelectedGift(null);
  };

  const handleAddGift = () => {
    if (!newGift.name) return;

    const points = newGift.type === 'physical'
      ? Math.round((newGift.priceYuan || 0) * settings.pointsPerYuan)
      : newGift.points;

    const gift: Gift = {
      id: Date.now().toString(),
      name: newGift.name,
      emoji: newGift.emoji,
      type: newGift.type,
      priceYuan: newGift.type === 'physical' ? newGift.priceYuan : undefined,
      points,
      order: gifts.length,
      userId: 'local',
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_GIFT', payload: gift });

    setShowAddModal(false);
    setNewGift({
      name: '',
      emoji: '🎁',
      type: 'physical',
      priceYuan: 0,
      points: 0,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 积分显示 */}
      <div className="bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] rounded-2xl p-6 mb-6 text-white">
        <div className="text-sm opacity-80">可用积分</div>
        <div className="text-4xl font-bold">{totalPoints}</div>
        <div className="text-sm opacity-80 mt-1">
          ≈ ¥{(totalPoints / settings.pointsPerYuan).toFixed(2)}
        </div>
      </div>

      {/* 礼品列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift) => {
          const canRedeem = totalPoints >= gift.points;
          return (
            <div key={gift.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {gift.photoUrl ? (
                <img src={gift.photoUrl} alt={gift.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-6xl">
                  {gift.emoji || '🎁'}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {gift.type === 'physical' ? '🎁 实物' : '⭐ 特权'}
                  </span>
                </div>
                <div className="font-semibold text-lg">{gift.name}</div>
                <div className="text-[#7C6FFF] font-bold text-xl mt-1">{gift.points} 积分</div>
                <button
                  onClick={() => handleRedeem(gift)}
                  disabled={!canRedeem}
                  className={`w-full mt-3 py-2 rounded-xl font-semibold transition-all ${
                    canRedeem
                      ? 'bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? '兑换' : '积分不足'}
                </button>
              </div>
            </div>
          );
        })}

        {/* 添加新礼品 */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center min-h-[280px] hover:border-[#7C6FFF] transition-colors"
        >
          <span className="text-5xl mb-2">➕</span>
          <span className="text-gray-500">添加新礼品</span>
        </button>
      </div>

      {/* 添加礼品弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">添加新礼品</h3>


            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2">名称</label>
              <input
                type="text"
                value={newGift.name}
                onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2">emoji</label>
              <input
                type="text"
                value={newGift.emoji}
                onChange={(e) => setNewGift({ ...newGift, emoji: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2">类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewGift({ ...newGift, type: 'physical' })}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    newGift.type === 'physical'
                      ? 'bg-[#7C6FFF] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🎁 实物
                </button>
                <button
                  onClick={() => setNewGift({ ...newGift, type: 'privilege' })}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    newGift.type === 'privilege'
                      ? 'bg-[#7C6FFF] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  ⭐ 特权
                </button>
              </div>
            </div>

            {newGift.type === 'physical' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-2">金额（元）</label>
                <input
                  type="number"
                  value={newGift.priceYuan || ''}
                  onChange={(e) => setNewGift({ ...newGift, priceYuan: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
                <div className="text-sm text-gray-400 mt-1">
                  积分: {Math.round((newGift.priceYuan || 0) * settings.pointsPerYuan)}
                </div>
              </div>
            )}

            {newGift.type === 'privilege' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-2">积分</label>
                <input
                  type="number"
                  value={newGift.points || ''}
                  onChange={(e) => setNewGift({ ...newGift, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddGift}
                disabled={!newGift.name}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 兑换确认弹窗 */}
      {showRedeemModal && selectedGift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">确认兑换</h3>
            <div className="text-center py-6">
              {selectedGift.photoUrl ? (
                <img src={selectedGift.photoUrl} alt={selectedGift.name} className="w-32 h-32 object-cover rounded-xl mx-auto mb-4" />
              ) : (
                <div className="text-6xl mb-4">{selectedGift.emoji}</div>
              )}
              <div className="text-xl font-semibold">{selectedGift.name}</div>
              <div className="text-[#7C6FFF] font-bold text-2xl mt-2">-{selectedGift.points} 积分</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold"
              >
                取消
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold"
              >
                确认兑换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
