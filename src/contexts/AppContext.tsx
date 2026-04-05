import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { UserData, Habit, Gift, Transaction, Settings, Level } from '../types';

const STORAGE_KEY = 'kids_points_data';

// 本地存储数据结构
interface LocalStorageData {
  userData: UserData;
  habits: Habit[];
  gifts: Gift[];
  transactions: Transaction[];
  settings: Settings;
}

const defaultSettings: Settings = {
  pointsPerYuan: 100,
  levels: [
    { name: '新手星', minPoints: 0 },
    { name: '努力星', minPoints: 500 },
    { name: '超级星', minPoints: 2000 },
    { name: '闪耀星', minPoints: 5000 },
    { name: '传奇星', minPoints: 10000 },
  ],
};

const defaultUserData: UserData = {
  child: { name: '', avatarEmoji: '👶', birthday: '', totalPoints: 0 },
  parents: [{ name: '爸爸' }, { name: '妈妈' }],
};

// 从 localStorage 加载数据
function loadData(): LocalStorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    userData: defaultUserData,
    habits: [],
    gifts: [],
    transactions: [],
    settings: defaultSettings,
  };
}

// 保存数据到 localStorage
function saveData(data: LocalStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

interface AppState {
  userData: UserData | null;
  habits: Habit[];
  gifts: Gift[];
  transactions: Transaction[];
  settings: Settings;
  isLoading: boolean;
}

type AppAction =
  | { type: 'LOAD_DATA'; payload: LocalStorageData }
  | { type: 'SET_USER_DATA'; payload: UserData }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_GIFTS'; payload: Gift[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'ADD_GIFT'; payload: Gift }
  | { type: 'UPDATE_GIFT'; payload: Gift }
  | { type: 'DELETE_GIFT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'REVERT_TRANSACTION'; payload: { transactionId: string; points: number } }
  | { type: 'UPDATE_CHILD'; payload: Partial<UserData['child']> }
  | { type: 'ADD_PARENT'; payload: string }
  | { type: 'DELETE_PARENT'; payload: string };

const initialState: AppState = {
  userData: null,
  habits: [],
  gifts: [],
  transactions: [],
  settings: defaultSettings,
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        userData: action.payload.userData,
        habits: action.payload.habits,
        gifts: action.payload.gifts,
        transactions: action.payload.transactions,
        settings: action.payload.settings,
        isLoading: false,
      };

    case 'SET_USER_DATA':
      newState = { ...state, userData: action.payload };
      break;

    case 'SET_HABITS':
      newState = { ...state, habits: action.payload };
      break;

    case 'SET_GIFTS':
      newState = { ...state, gifts: action.payload };
      break;

    case 'SET_TRANSACTIONS':
      newState = { ...state, transactions: action.payload };
      break;

    case 'SET_SETTINGS':
      newState = { ...state, settings: action.payload };
      break;

    case 'ADD_HABIT':
      newState = { ...state, habits: [...state.habits, action.payload] };
      break;

    case 'UPDATE_HABIT':
      newState = {
        ...state,
        habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };
      break;

    case 'DELETE_HABIT':
      newState = { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
      break;

    case 'ADD_GIFT':
      newState = { ...state, gifts: [...state.gifts, action.payload] };
      break;

    case 'UPDATE_GIFT':
      newState = {
        ...state,
        gifts: state.gifts.map((g) => (g.id === action.payload.id ? action.payload : g)),
      };
      break;

    case 'DELETE_GIFT':
      newState = { ...state, gifts: state.gifts.filter((g) => g.id !== action.payload) };
      break;

    case 'ADD_TRANSACTION':
      newState = { ...state, transactions: [action.payload, ...state.transactions] };
      break;

    case 'REVERT_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.transactionId
            ? { ...tx, isReverted: true, revertedAt: new Date() }
            : tx
        ),
      };
      break;

    case 'ADD_PARENT':
      newState = {
        ...state,
        userData: state.userData
          ? { ...state.userData, parents: [...state.userData.parents, { name: action.payload }] }
          : null,
      };
      break;

    case 'DELETE_PARENT':
      newState = {
        ...state,
        userData: state.userData
          ? { ...state.userData, parents: state.userData.parents.filter((p) => p.name !== action.payload) }
          : null,
      };
      break;

    case 'UPDATE_CHILD':
      newState = {
        ...state,
        userData: state.userData
          ? { ...state.userData, child: { ...state.userData.child, ...action.payload } }
          : null,
      };
      break;

    default:
      return state;
  }

  // 自动保存到 localStorage
  if (newState.userData && newState !== state) {
    saveData({
      userData: newState.userData,
      habits: newState.habits,
      gifts: newState.gifts,
      transactions: newState.transactions,
      settings: newState.settings,
    });
  }

  return newState;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 加载本地数据
  useEffect(() => {
    const data = loadData();
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// 获取当前等级
export function getCurrentLevel(totalPoints: number, levels: Level[]): Level {
  const sortedLevels = [...levels].sort((a, b) => b.minPoints - a.minPoints);
  return sortedLevels.find((level) => totalPoints >= level.minPoints) || levels[0];
}

// 获取下一等级
export function getNextLevel(totalPoints: number, levels: Level[]): Level | null {
  const sortedLevels = [...levels].sort((a, b) => a.minPoints - b.minPoints);
  return sortedLevels.find((level) => level.minPoints > totalPoints) || null;
}
