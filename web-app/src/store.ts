import {
  PayloadAction,
  configureStore,
  createSlice,
  createEntityAdapter,
  combineReducers,
  createSelector,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Entity, EntityType, Tool } from './data/types';

const initialState: {
  mode: string;
  background: string;
  tool: Tool;
  selected: string;
  dialogOpen: boolean;
} = {
  mode: 'edit',
  background: 'bg1',
  tool: Tool.Select,
  selected: '',
  dialogOpen: false,
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
      return { ...state, mode: action.payload };
    },
    updateBackground(state: any, action: PayloadAction<string>) {
      return { ...state, background: action.payload };
    },
    switchTool(state: any, action: PayloadAction<Tool>) {
      return { ...state, tool: action.payload };
    },
    select(state: any, action: PayloadAction<string>) {
      return { ...state, selected: action.payload };
    },
    dialogOpened(state: any, action: PayloadAction<boolean>) {
      return { ...state, dialogOpen: action.payload };
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
  switchTool,
  select,
  dialogOpened,
} = canvasSlice.actions;
export const {
  entityAdded,
  entitiesAdded,
  entityLoaded,
  entityUpdated,
  entityDeleted,
  entityUpdateXYZ,
  entityUpdateScale,
  deleteSuccess,
} = entitiesSlice.actions;
