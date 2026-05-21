import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  xp?: number;
  streak?: number;
  rank?: string;
  badges?: string[];
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially loading while we check session
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUserXP: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.xp = (state.user.xp || 0) + action.payload;
      }
    },
    updateUserStats: (
      state,
      action: PayloadAction<{ xp: number; rank: string; streak: number }>,
    ) => {
      if (state.user) {
        state.user.xp = action.payload.xp;
        state.user.rank = action.payload.rank;
        state.user.streak = action.payload.streak;
      }
    },
  },
});

export const { setUser, logoutUser, setLoading, updateUserXP, updateUserStats } = authSlice.actions;

export default authSlice.reducer;
