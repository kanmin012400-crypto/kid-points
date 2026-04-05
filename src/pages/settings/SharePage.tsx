import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateShareUrl, getShareTypeName, getShareTypeDesc, parseShareData, previewShareData, type ShareType, type ShareData } from '../../services/shareService';
import { useApp } from '../../contexts/AppContext';

type Tab = 'share' | 'import';

export default function SharePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<Tab>('share');
  const [selectedType, setSelectedType] = useState<ShareType | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 导入相关
  const [importUrl, setImportUrl] = useState('');
  const [importData, setImportData] = useState<ShareData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const shareTypes: ShareType[] = ['config', 'records', 'all'];

  const handleGenerate = (type: ShareType) => {
    setSelectedType(type);
    const url = generateShareUrl(type, {
      userData: state.userData!,
      habits: state.habits,
      gifts: state.gifts,
      transactions: state.transactions,
      settings: state.settings,
    });
    setShareUrl(url);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleParseImportUrl = () => {
    setImportError(null);
    setImportData(null);
    if (!importUrl.trim()) {
      setImportError('请粘贴分享链接');
      return;
    }
    const data = parseShareData(importUrl.trim());
    if (!data) {
      setImportError('链接格式不正确或已损坏');
      return;
    }
    setImportData(data);
  };

  const handleImport = () => {
    if (!importData) return;
    setImporting(true);

    try {
      switch (importData.type) {
        case 'config':
          dispatch({ type: 'SET_USER_DATA', payload: importData.data.userData });
          dispatch({ type: 'SET_HABITS', payload: importData.data.habits });
          dispatch({ type: 'SET_GIFTS', payload: importData.data.gifts });
          dispatch({ type: 'SET_SETTINGS', payload: importData.data.settings });
          break;

        case 'records': {
          const existingTxIds = new Set(state.transactions.map((t) => t.id));
          const newTransactions = importData.data.transactions.filter(
            (t) => !existingTxIds.has(t.id)
          );
          if (newTransactions.length > 0) {
            dispatch({ type: 'SET_TRANSACTIONS', payload: [...state.transactions, ...newTransactions] });
          }
          break;
        }

        case 'all':
          dispatch({ type: 'SET_USER_DATA', payload: importData.data.userData });
          dispatch({ type: 'SET_HABITS', payload: importData.data.habits });
          dispatch({ type: 'SET_GIFTS', payload: importData.data.gifts });
          dispatch({ type: 'SET_TRANSACTIONS', payload: importData.data.transactions });
          dispatch({ type: 'SET_SETTINGS', payload: importData.data.settings });
          break;
      }

      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch {
      setImportError('导入失败，请重试');
      setImporting(false);
    }
  };

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 头部 */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBack} className="text-2xl">←</button>
        <h1 className="text-2xl font-bold">分享 / 导入</h1>
      </div>

      {/* Tab 切换 */}
      <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm">
        <button
          onClick={() => { setTab('share'); setShareUrl(null); setSelectedType(null); }}
          className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
            tab === 'share'
              ? 'bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white shadow-sm'
              : 'text-gray-500'
          }`}
        >
          分享数据
        </button>
        <button
          onClick={() => { setTab('import'); setImportUrl(''); setImportData(null); setImportError(null); }}
          className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
            tab === 'import'
              ? 'bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white shadow-sm'
              : 'text-gray-500'
          }`}
        >
          导入数据
        </button>
      </div>

      {/* 分享区域 */}
      {tab === 'share' && !shareUrl && (
        <>
          <p className="text-gray-500 mb-6">
            选择要分享的内容，生成分享链接。接收方打开链接后可一键导入。
          </p>

          <div className="space-y-3">
            {shareTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleGenerate(type)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedType === type
                    ? 'border-[#7C6FFF] bg-purple-50'
                    : 'border-gray-100 bg-white hover:border-[#7C6FFF]/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    {type === 'config' ? '⚙️' : type === 'records' ? '📋' : '📦'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base mb-1">
                      {getShareTypeName(type)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {getShareTypeDesc(type)}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xl mt-1">›</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'share' && shareUrl && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">
                {selectedType === 'config' ? '⚙️' : selectedType === 'records' ? '📋' : '📦'}
              </div>
              <div>
                <div className="font-semibold">{getShareTypeName(selectedType!)}</div>
                <div className="text-gray-500 text-sm">{getShareTypeDesc(selectedType!)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 break-all">
              <div className="text-xs text-gray-400 mb-2">分享链接</div>
              <div className="text-sm text-gray-700 leading-relaxed">{shareUrl}</div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold"
            >
              {copied ? '✓ 已复制' : '复制链接'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              复制链接后发送给接收方，对方打开链接即可导入数据
            </p>
          </div>

          <button
            onClick={() => setShareUrl(null)}
            className="w-full py-3 border border-gray-200 rounded-xl font-semibold text-gray-600"
          >
            返回重新选择
          </button>
        </div>
      )}

      {/* 导入区域 */}
      {tab === 'import' && !importData && (
        <>
          <p className="text-gray-500 mb-6">
            粘贴别人分享给你的链接，即可一键导入数据。
          </p>

          <div className="bg-white rounded-2xl p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分享链接
              </label>
              <textarea
                value={importUrl}
                onChange={(e) => {
                  setImportUrl(e.target.value);
                  setImportError(null);
                  setImportData(null);
                }}
                placeholder="请粘贴分享链接..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C6FFF] resize-none text-sm"
              />
            </div>

            {importError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {importError}
              </div>
            )}

            <button
              onClick={handleParseImportUrl}
              className="w-full py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold"
            >
              解析链接
            </button>
          </div>
        </>
      )}

      {tab === 'import' && importData && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📦</div>
              <div>
                <div className="font-semibold">检测到数据分享</div>
                <div className="text-gray-500 text-sm">{previewShareData(importData)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-xs text-gray-400 mb-1">分享类型</div>
              <div className="text-sm text-gray-700">
                {importData.type === 'config' ? '⚙️ 配置数据' :
                 importData.type === 'records' ? '📋 记录数据' : '📦 全部数据'}
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4 text-center">
              点击"导入"将覆盖/追加数据，确认后操作不可撤销。
            </p>

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-3 bg-gradient-to-r from-[#7C6FFF] to-[#F76F8E] text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {importing ? '导入中...' : '导入数据'}
            </button>

            <button
              onClick={() => { setImportData(null); setImportUrl(''); }}
              className="w-full py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 mt-3"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
