import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, getCurrentLevel, getNextLevel } from '../../contexts/AppContext';

export default function DisplayModePage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { userData, gifts, settings } = state;

  const totalPoints = userData?.child?.totalPoints || 0;
  const currentLevel = useMemo(() => getCurrentLevel(totalPoints, settings.levels), [totalPoints, settings.levels]);
  const nextLevel = useMemo(() => getNextLevel(totalPoints, settings.levels), [totalPoints, settings.levels]);

  const progressPercent = useMemo(() => {
    if (!nextLevel) return 100;
    const prevMin = currentLevel.minPoints;
    const nextMin = nextLevel.minPoints;
    return Math.min(100, ((totalPoints - prevMin) / (nextMin - prevMin)) * 100);
  }, [totalPoints, currentLevel, nextLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#7C6FFF] to-[#F76F8E] flex flex-col items-center justify-center p-4 sm:p-8 cursor-pointer"
      onClick={() => navigate('/')}
    >
      {/* 退出按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate('/');
        }}
        className="absolute top-6 right-6 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center text-2xl hover:bg-white/30 transition-colors safe-area-top"
      >
        ✕
      </button>

      {/* 孩子头像 */}
      <div className="text-7xl sm:text-9xl mb-4">{userData?.child?.avatarEmoji || '👶'}</div>

      {/* 名字 */}
      <h1 className="text-white text-3xl sm:text-4xl font-bold mb-8">{userData?.child?.name || '孩子'}</h1>

      {/* 总积分大字 */}
      <div className="text-white text-6xl sm:text-8xl font-bold mb-4">{totalPoints}</div>
      <div className="text-white/70 text-xl sm:text-2xl mb-8">积分</div>

      {/* 等级徽章 */}
      <div className="bg-white/20 backdrop-blur px-6 sm:px-8 py-3 sm:py-4 rounded-full mb-8">
        <span className="text-2xl sm:text-3xl mr-2">⭐</span>
        <span className="text-white text-xl sm:text-2xl font-bold">{currentLevel.name}</span>
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-md mb-8">
        <div className="h-6 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {nextLevel && (
          <div className="text-white/70 text-center mt-2">
            距离 {nextLevel.name} 还需 {nextLevel.minPoints - totalPoints} 积分
          </div>
        )}
      </div>

      {/* 可兑换礼品 */}
      <div className="w-full max-w-2xl">
        <h2 className="text-white text-xl font-semibold mb-4 text-center">可兑换礼品</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {gifts.map((gift) => {
            const canRedeem = totalPoints >= gift.points;
            return (
              <div
                key={gift.id}
                className={`bg-white/10 backdrop-blur rounded-2xl p-4 text-center ${
                  canRedeem ? '' : 'opacity-50'
                }`}
              >
                <div className="text-5xl mb-2">{gift.emoji || '🎁'}</div>
                <div className="text-white font-medium">{gift.name}</div>
                <div className="text-white/80 mt-1">
                  {gift.points} 积分
                  {canRedeem ? ' ✅' : ' 🔒'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 提示 */}
      <div className="text-white/50 text-sm mt-8">点击空白区域或按 ESC 返回</div>
    </div>
  );
}
