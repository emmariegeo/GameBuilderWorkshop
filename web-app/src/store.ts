import {
  PayloadAction,
  configureStore,
  createSlice,
  createEntityAdapter,
  combineReducers,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Entity, Tool } from './data/types';

export enum dialogState {
  Closed = 'CLOSED',
  Delete = 'DELETE',
  Duplicate = 'DUPLICATE',
}

const initialState: {
  mode: string;
  background: string;
  effect: '';
  audio: string;
  tool: Tool;
  selected: string;
  dialogOpen: dialogState;
  modeSwitch: string;
} = {
  mode: 'edit',
  background: 'bg1',
  effect: '',
  audio: '',
  tool: Tool.Select,
  selected: '',
  dialogOpen: dialogState.Closed,
  modeSwitch: 'idle',
};

// Normalizing game object data
const entitiesAdapter = createEntityAdapter<Entity>({
  selectId: (entity) => entity.id,
});

// REDUCER for Entities
const entitiesSlice = createSlice({
  name: 'entities',
  initialState: entitiesAdapter.getInitialState({ deletion: 'idle' }),
  reducers: {
    // Can pass adapter functions directly as case reducers.  Because we're passing this
    // as a value, `createSlice` will auto-generate the `entityAdded` action type / creator
    entityAdded: entitiesAdapter.setOne,
    entityDeleted(state, action) {
      if (state.deletion === 'idle') {
        state.deletion = 'pending';
      }
      entitiesAdapter.removeOne(state, action.payload);
    },
    deleteSuccess(state) {
      if (state.deletion === 'pending') {
        state.deletion = 'idle';
      }
    },
    entityUpdated: entitiesAdapter.updateOne,
    entityLoaded(state, action) {
      if (action.payload.loaded == false) {
        entitiesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { loaded: true },
        });
      }
    },
    entityUnloaded(state, action) {
      if (action.payload.loaded == false) {
        entitiesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { loaded: false },
        });
      }
    },
    entityFlipX(
      state,
      action: {
        payload: { id: string; flipX: boolean };
      }
    ) {
      entitiesAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          flipX: action.payload.flipX,
        },
      });
    },
    entityUpdateXYZ(
      state,
      action: {
        payload: { id: string; position: { x: number; y: number; z: number } };
      }
    ) {
      entitiesAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          x: action.payload.position.x,
          y: action.payload.position.y,
          z: action.payload.position.z,
        },
      });
    },
    entityUpdateScale(
      state,
      action: {
        payload: {
          id: string;
          changes: {
            width: number;
            height: number;
            scaleX: number;
            scaleY: number;
            scale: number;
            x: number;
            y: number;
          };
        };
      }
    ) {
      entitiesAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          width: action.payload.changes.width,
          height: action.payload.changes.height,
          scaleX: action.payload.changes.scaleX,
          scaleY: action.payload.changes.scaleY,
          scale: action.payload.changes.scale,
          x: action.payload.changes.x,
          y: action.payload.changes.y,
        },
      });
    },
    entitiesAdded: entitiesAdapter.setAll,
  },
});

// REDUCER
const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    switchMode(state: any, action: PayloadAction<string>) {
      return { ...state, modeSwitch: 'pending', mode: action.payload };
    },
    modeSwitched(state) {
      if (state.modeSwitch === 'pending') {
        state.modeSwitch = 'idle';
      }
    },
    updateBackground(state: any, action: PayloadAction<string>) {
      return { ...state, background: action.payload };
    },
    updateEffect(state: any, action: PayloadAction<string>) {
      return { ...state, effect: action.payload };
    },
    updateAudio(state: any, action: PayloadAction<string>) {
      return { ...state, audio: action.payload };
    },
    switchTool(state: any, action: PayloadAction<Tool>) {
      return { ...state, tool: action.payload };
    },
    select(state: any, action: PayloadAction<string>) {
      return { ...state, selected: action.payload };
    },
    dialogOpened(state: any, action: PayloadAction<dialogState>) {
      return { ...state, dialogOpen: action.payload };
    },
    reset() {
      return { ...initialState, modeSwitch: 'pending' };
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const reducer = combineReducers({
  canvas: canvasSlice.reducer,
  entities: entitiesSlice.reducer,
});

// Can create a set of memoized selectors based on the location of this entity state
const entitiesSelectors = entitiesAdapter.getSelectors<RootState>(
  (state) => state.entities
);
export const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// And then use the selectors to retrieve values
export const allEntities = () => {
  return entitiesSelectors.selectAll(store.getState());
};
export const entityById = (id: string) => {
  return entitiesSelectors.selectById(store.getState(), id);
};

export const {
  switchMode,
  updateBackground,
  updateEffect,
  updateAudio,
  switchTool,
  select,
  dialogOpened,
  modeSwitched,
  reset,
} = canvasSlice.actions;
export const {
  entityAdded,
  entitiesAdded,
  entityLoaded,
  entityUpdated,
  entityDeleted,
  entityFlipX,
  entityUpdateXYZ,
  entityUpdateScale,
  deleteSuccess,
} = entitiesSlice.actions;
