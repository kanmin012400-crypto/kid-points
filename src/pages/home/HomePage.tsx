import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, getCurrentLevel, getNextLevel } from '../../contexts/AppContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { userData, transactions, settings } = state;

  const totalPoints = userData?.child?.totalPoints || 0;
  const currentLevel = useMemo(() => getCurrentLevel(totalPoints, settings.levels), [totalPoints, settings.levels]);
  const nextLevel = useMemo(() => getNextLevel(totalPoints, settings.levels), [totalPoints, settings.levels]);

  // 今日统计
  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTxs = transactions.filter((tx) => {
      if (tx.isReverted) return false;
      const txDate = new Date(tx.createdAt);
      return txDate >= today;
    });
    return {
      reward: todayTxs.filter((tx) => tx.points > 0).reduce((sum, tx) => sum + tx.points, 0),
      punish: todayTxs.filter((tx) => tx.points < 0).reduce((sum, tx) => sum + tx.points, 0),
    };
  }, [transactions]);

  // 连续打卡天数
  const streak = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const hasReward = transactions.some(
        (tx) => {
          if (tx.isReverted || tx.points <= 0) return false;
          const txDate = new Date(tx.createdAt);
          return txDate >= date && txDate < nextDate;
        }
      );
      if (hasReward) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [transactions]);

  // 最近动态
  const recentTransactions = useMemo(() => {
    return transactions.filter((tx) => !tx.isReverted).slice(0, 10);
  }, [transactions]);

  // 进度条百分比
  const progressPercent = useMemo(() => {
    if (!nextLevel) return 100;
    const prevMin = currentLevel.minPoints;
    const nextMin = nextLevel.minPoints;
    return Math.min(100, ((totalPoints - prevMin) / (nextMin - prevMin)) * 100);
  }, [totalPoints, currentLevel, nextLevel]);

  const handleEnterDisplayMode = () => {
    navigate('/display');
  };

  const handleRevert = (txId: string, points: number) => {
    if (!confirm('确定撤回此记录？积分将相应回滚。')) return;
    dispatch({ type: 'REVERT_TRANSACTION', payload: { transactionId: txId, points } });
    // 回滚积分
    dispatch({ type: 'UPDATE_CHILD', payload: { totalPoints: (userData?.child?.totalPoints || 0) - points } });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 大字积分显示 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 text-center">
        <div className="text-6xl font-bold text-[#08060d] mb-2">
          {totalPoints}
        </div>
        <div className="text-gray-500 text-lg">总积分</div>
        <div className="text-4xl mt-4">{userData?.child?.avatarEmoji || '👶'}</div>
        <div className="text-xl font-semibold mt-2">{userData?.child?.name || '孩子'}</div>
      </div>

      {/* 今日统计 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-[#3ECA6A]">+{todayStats.reward}</div>
          <div className="text-gray-500 mt-1">今日奖励</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-[#FF5757]">{todayStats.punish}</div>
          <div className="text-gray-500 mt-1">今日扣除</div>
        </div>
      </div>

      {/* 等级进度条 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold text-lg">{currentLevel.name}</span>
          </div>
          <div className="text-gray-500">
            {nextLevel ? `${nextLevel.name} ${nextLevel.minPoints}积分` : '最高等级'}
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          {totalPoints} / {nextLevel?.minPoints || totalPoints} 积分
        </div>
      </div>

      {/* 连续打卡 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold">{streak}</span>
          <span className="text-gray-500">连续打卡天数</span>
        </div>
      </div>

      {/* 最近动态 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">最近动态</h2>
        {recentTransactions.length === 0 ? (
          <div className="text-gray-400 text-center py-8">暂无记录</div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {tx.points > 0 ? '🌟' : '⚠️'}
                  </span>
                  <div>
                    <div className="font-medium">{tx.habitName}</div>
                    {tx.note && <div className="text-sm text-gray-400">备注: {tx.note}</div>}
                    <div className="text-sm text-gray-500">
                      {tx.createdBy} · {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-bold ${tx.points > 0 ? 'text-[#3ECA6A]' : 'text-[#FF5757]'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </div>
                  <button
                    onClick={() => handleRevert(tx.id, tx.points)}
                    className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100"
                  >
                    撤回
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 展示模式入口 */}
      <button
        onClick={handleEnterDisplayMode}
        className="fixed top-4 right-4 w-12 h-12 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform safe-area-top"
        title="展示模式"
      >
        📺
      </button>
    </div>
  );
}
