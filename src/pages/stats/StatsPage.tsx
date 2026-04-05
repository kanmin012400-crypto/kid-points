import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';

type TimeRange = 'today' | 'week' | 'month' | 'all';

export default function StatsPage() {
  const { state } = useApp();
  const { transactions } = state;
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((tx) => {
      if (tx.isReverted) return false;
      const txDate = new Date(tx.createdAt);

      switch (timeRange) {
        case 'today':
          return txDate >= startOfDay;
        case 'week':
          const weekAgo = new Date(startOfDay);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return txDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(startOfDay);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return txDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  }, [transactions, timeRange]);

  const stats = useMemo(() => {
    const rewardPoints = filteredTransactions
      .filter((tx) => tx.points > 0)
      .reduce((sum, tx) => sum + tx.points, 0);

    // 惩罚扣除（积分<0且不是兑换）
    const punishPoints = filteredTransactions
      .filter((tx) => tx.points < 0 && !tx.habitName.startsWith('兑换:'))
      .reduce((sum, tx) => sum + tx.points, 0);

    // 兑换扣除（积分<0且是兑换）
    const redeemPoints = filteredTransactions
      .filter((tx) => tx.points < 0 && tx.habitName.startsWith('兑换:'))
      .reduce((sum, tx) => sum + tx.points, 0);

    // 兑换次数
    const redemptionCount = filteredTransactions
      .filter((tx) => tx.points < 0 && tx.habitName.startsWith('兑换:'))
      .length;

    // 习惯完成频次
    const habitCounts: Record<string, { name: string; count: number }> = {};
    filteredTransactions.forEach((tx) => {
      if (tx.points > 0 && !habitCounts[tx.habitId]) {
        habitCounts[tx.habitId] = { name: tx.habitName, count: 0 };
      }
      if (tx.points > 0) {
        habitCounts[tx.habitId].count++;
      }
    });
    const habitRanks = Object.values(habitCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      rewardPoints,
      punishPoints,
      redeemPoints,
      netPoints: rewardPoints + punishPoints + redeemPoints,
      redemptionCount,
      habitRanks,
    };
  }, [filteredTransactions]);

  const dailyPointsData = useMemo(() => {
    const days: Record<string, number> = {};

    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString();
      days[date] = (days[date] || 0) + tx.points;
    });

    const entries = Object.entries(days).map(([date, points]) => ({ date, points }));

    // 根据时间范围确定显示的天数
    let limit = 7;
    if (timeRange === 'today') {
      limit = 1;
    } else if (timeRange === 'week') {
      limit = 7;
    } else if (timeRange === 'month') {
      limit = 30;
    } else {
      limit = entries.length;
    }

    return entries.slice(-limit);
  }, [filteredTransactions, timeRange]);

  // 连续打卡
  const streak = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const hasReward = transactions.some(
        (tx) => !tx.isReverted && tx.points > 0 && new Date(tx.createdAt).toLocaleDateString() === dateStr
      );
      if (hasReward) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [transactions]);

  // 本周最佳习惯
  const bestHabit = useMemo(() => {
    if (stats.habitRanks.length === 0) return null;
    return stats.habitRanks[0];
  }, [stats.habitRanks]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 时间维度切换 */}
      <div className="flex gap-2 mb-6">
        {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {range === 'today' ? '今日' : range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
          </button>
        ))}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">奖励积分</div>
          <div className="text-3xl font-bold text-[#3ECA6A]">+{stats.rewardPoints}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">惩罚扣除</div>
          <div className="text-3xl font-bold text-[#FF5757]">{stats.punishPoints}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">兑换扣除</div>
          <div className="text-3xl font-bold text-[#FF8C00]">{stats.redeemPoints}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">净增积分</div>
          <div className="text-3xl font-bold text-[#7C6FFF]">
            {stats.netPoints > 0 ? '+' : ''}{stats.netPoints}
          </div>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">每日积分变化</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyPointsData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="points"
                fill="url(#gradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6FFF" />
                  <stop offset="100%" stopColor="#F76F8E" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 连续打卡 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🔥</span>
          <div>
            <div className="text-3xl font-bold">{streak}</div>
            <div className="text-gray-500">连续打卡天数</div>
          </div>
        </div>
      </div>

      {/* 习惯完成频次排名 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">习惯完成频次排名</h3>
        {stats.habitRanks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无数据</div>
        ) : (
          <div className="space-y-3">
            {stats.habitRanks.map((habit, index) => (
              <div key={habit.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{habit.name}</span>
                </div>
                <span className="text-gray-500">{habit.count} 次</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 本周最佳习惯 */}
      {bestHabit && (
        <div className="bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] rounded-2xl p-6 mt-6 text-white">
          <div className="text-sm opacity-80 mb-1">🏆 本期最佳习惯</div>
          <div className="text-2xl font-bold">{bestHabit.name}</div>
          <div className="text-sm opacity-80 mt-1">完成 {bestHabit.count} 次</div>
        </div>
      )}
    </div>
  );
}
