import LZString from 'lz-string';
import type { UserData, Habit, Gift, Transaction, Settings, Redemption } from '../types';

// 分享数据类型
export type ShareType = 'config' | 'records' | 'all';

// 分享数据包结构
export interface ShareConfig {
  version: 1;
  type: 'config';
  data: {
    userData: UserData;
    habits: Habit[];
    gifts: Gift[];
    settings: Settings;
  };
}

export interface ShareRecords {
  version: 1;
  type: 'records';
  data: {
    transactions: Transaction[];
    redemptions: Redemption[];
  };
}

export interface ShareAll {
  version: 1;
  type: 'all';
  data: {
    userData: UserData;
    habits: Habit[];
    gifts: Gift[];
    transactions: Transaction[];
    settings: Settings;
    // redemptions are embedded in transactions
  };
}

export type ShareData = ShareConfig | ShareRecords | ShareAll;

// 编码
function encode(data: ShareData): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

// 生成分享链接
export function generateShareUrl(type: ShareType, data: {
  userData: UserData;
  habits: Habit[];
  gifts: Gift[];
  transactions: Transaction[];
  settings: Settings;
}): string {
  const shareData = buildShareData(type, data);
  const encoded = encode(shareData);
  // 使用当前页面基础路径，支持 GitHub Pages 的 hash 路由
  const base = window.location.origin + window.location.pathname;
  return `${base}#/import/${encoded}`;
}

// 构建分享数据包
function buildShareData(type: ShareType, data: {
  userData: UserData;
  habits: Habit[];
  gifts: Gift[];
  transactions: Transaction[];
  settings: Settings;
}): ShareData {
  switch (type) {
    case 'config':
      return {
        version: 1,
        type: 'config',
        data: {
          userData: data.userData,
          habits: data.habits,
          gifts: data.gifts,
          settings: data.settings,
        },
      };
    case 'records':
      return {
        version: 1,
        type: 'records',
        data: {
          transactions: data.transactions,
          redemptions: [], // 后续可扩展
        },
      };
    case 'all':
      return {
        version: 1,
        type: 'all',
        data: {
          userData: data.userData,
          habits: data.habits,
          gifts: data.gifts,
          transactions: data.transactions,
          settings: data.settings,
        },
      };
  }
}

// 从 URL hash 或完整 URL 解析分享数据
export function parseShareData(input: string): ShareData | null {
  // 提取 hash 部分（兼容完整 URL 和纯 hash）
  let hash = input.trim();
  const hashIdx = hash.indexOf('#/import/');
  if (hashIdx !== -1) {
    hash = hash.slice(hashIdx);
  } else if (!hash.startsWith('#/import/')) {
    return null;
  }

  // hash 格式: #/import/<encoded>
  const match = hash.match(/^#\/import\/(.+)$/);
  if (!match) return null;

  const encoded = match[1];

  // 尝试直接解码
  let json = LZString.decompressFromEncodedURIComponent(encoded);
  // 如果失败，尝试 URL decode 一次后再解码（兼容粘贴时被浏览器额外编码的情况）
  if (!json) {
    try {
      const decoded = decodeURIComponent(encoded);
      json = LZString.decompressFromEncodedURIComponent(decoded);
    } catch {
      // ignore
    }
  }

  if (!json) return null;
  try {
    return JSON.parse(json) as ShareData;
  } catch {
    return null;
  }
}

// 获取分享类型的中文名称
export function getShareTypeName(type: ShareType): string {
  switch (type) {
    case 'config': return '配置数据';
    case 'records': return '记录数据';
    case 'all': return '全部数据';
  }
}

// 获取分享类型的描述
export function getShareTypeDesc(type: ShareType): string {
  switch (type) {
    case 'config':
      return '包含孩子信息、家长信息、习惯、礼品、兑换比例和等级设置';
    case 'records':
      return '包含所有奖励、惩罚和兑换记录';
    case 'all':
      return '包含以上所有数据的完整备份';
  }
}

// 预览分享内容（用于确认弹框）
export function previewShareData(data: ShareData): string {
  switch (data.type) {
    case 'config':
      return `配置数据：${data.data.habits.length} 个习惯，${data.data.gifts.length} 个礼品`;
    case 'records':
      return `记录数据：${data.data.transactions.length} 条记录`;
    case 'all':
      return `全部数据：${data.data.habits.length} 个习惯，${data.data.gifts.length} 个礼品，${data.data.transactions.length} 条记录`;
  }
}
