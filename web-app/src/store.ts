import { PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

const initialState: { mode: string, background: string } = { mode: 'edit', background: 'bg1' };

// REDUCER
const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        switchMode(state: any, action: PayloadAction<string>) {
            return { ...state, mode: action.payload }
        },
        updateBackground(state: any, action: PayloadAction<string>) {
            return { ...state, background: action.payload };
        }
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const store = configureStore({ reducer: gameSlice.reducer });
export const { switchMode, updateBackground } = gameSlice.actions;