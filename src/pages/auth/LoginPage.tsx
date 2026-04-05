import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      if (isRegister) {
        await register(email, password);
        // 初始化用户数据
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            child: { name: '', avatarEmoji: '👶', birthday: '', totalPoints: 0 },
            parents: [{ name: '爸爸' }, { name: '妈妈' }],
          });
          await setDoc(doc(db, 'settings', user.uid), {
            pointsPerYuan: 100,
            levels: [
              { name: '新手星', minPoints: 0 },
              { name: '努力星', minPoints: 500 },
              { name: '超级星', minPoints: 2000 },
              { name: '闪耀星', minPoints: 5000 },
              { name: '传奇星', minPoints: 10000 },
            ],
          });
        }
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⭐</div>
          <h1 className="text-2xl font-bold text-[#08060d]">积分统计</h1>
          <p className="text-gray-500 mt-2">帮助孩子养成好习惯</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C6FFF]"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {isLoading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              clearError();
            }}
            className="text-[#7C6FFF] font-medium"
          >
            {isRegister ? '已有账号？登录' : '没有账号？注册'}
          </button>
        </div>
      </div>
    </div>
  );
}
