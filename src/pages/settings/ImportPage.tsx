import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parseShareData, previewShareData, getShareTypeName, type ShareData } from '../../services/shareService';
import { useApp } from '../../contexts/AppContext';

export default function ImportPage() {
  const { encoded } = useParams<{ encoded: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!encoded) {
      setError('无效的分享链接');
      return;
    }
    const data = parseShareData('#/import/' + encoded);
    if (!data) {
      setError('数据解析失败，链接可能已损坏');
    } else {
      setShareData(data);
    }
  }, [encoded]);

  const handleImport = () => {
    if (!shareData) return;
    setImporting(true);

    try {
      switch (shareData.type) {
        case 'config':
          dispatch({ type: 'SET_USER_DATA', payload: shareData.data.userData });
          dispatch({ type: 'SET_HABITS', payload: shareData.data.habits });
          dispatch({ type: 'SET_GIFTS', payload: shareData.data.gifts });
          dispatch({ type: 'SET_SETTINGS', payload: shareData.data.settings });
          break;

        case 'records': {
          // 记录追加去重
          const existingTxIds = new Set(state.transactions.map((t) => t.id));
          const newTransactions = shareData.data.transactions.filter(
            (t) => !existingTxIds.has(t.id)
          );
          if (newTransactions.length > 0) {
            dispatch({ type: 'SET_TRANSACTIONS', payload: [...state.transactions, ...newTransactions] });
          }
          break;
        }

        case 'all':
          dispatch({ type: 'SET_USER_DATA', payload: shareData.data.userData });
          dispatch({ type: 'SET_HABITS', payload: shareData.data.habits });
          dispatch({ type: 'SET_GIFTS', payload: shareData.data.gifts });
          dispatch({ type: 'SET_TRANSACTIONS', payload: shareData.data.transactions });
          dispatch({ type: 'SET_SETTINGS', payload: shareData.data.settings });
          break;
      }

      // 延迟跳转，让 dispatch 完成
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (e) {
      setError('导入失败，请重试');
      setImporting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">导入失败</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleCancel}
            className="w-full py-3 bg-[#7C6FFF] text-white rounded-xl font-semibold"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-2">收到数据分享</h2>
          <p className="text-gray-500 text-sm">
            类型：{getShareTypeName(shareData.type)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">
            {previewShareData(shareData)}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6 text-center">
          点击"导入"将覆盖/追加数据，确认后操作不可撤销。
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex-1 py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {importing ? '导入中...' : '导入'}
          </button>
        </div>
      </div>
    </div>
  );
}
