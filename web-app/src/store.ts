// REDUX store
import {
  PayloadAction,
  configureStore,
  createSlice,
  createEntityAdapter,
  combineReducers,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Entity, Tool } from './data/types';

// Manage state of dialog (can be closed, or set to display delete or duplicate content)
export enum dialogState {
  Closed = 'CLOSED',
  Delete = 'DELETE',
  Duplicate = 'DUPLICATE',
}

// Initial state of the store
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
    // Add an entity
    entityAdded: entitiesAdapter.setOne,
    // Delete an entity
    entityDeleted(state, action) {
      if (state.deletion === 'idle') {
        state.deletion = 'pending';
      }
      entitiesAdapter.removeOne(state, action.payload);
    },
    // Successful delete
    deleteSuccess(state) {
      if (state.deletion === 'pending') {
        state.deletion = 'idle';
      }
    },
    // Update an entity
    entityUpdated: entitiesAdapter.updateOne,
    // Loaded an entity
    entityLoaded(state, action) {
      if (action.payload.loaded == false) {
        entitiesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { loaded: true },
        });
      }
    },
    // Unload an entity
    entityUnloaded(state, action) {
      if (action.payload.loaded == false) {
        entitiesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { loaded: false },
        });
      }
    },
    // Flip an entity horizontally
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
    // Update an entity's position
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
    // Update an entity's scale
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
    // Add multiple entities
    entitiesAdded: entitiesAdapter.setAll,
  },
});

// REDUCER
const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    // Switch between edit and play mode.
    switchMode(state: any, action: PayloadAction<string>) {
      return { ...state, modeSwitch: 'pending', mode: action.payload };
    },
    // Mode has been switched.
    modeSwitched(state) {
      if (state.modeSwitch === 'pending') {
        state.modeSwitch = 'idle';
      }
    },
    // Update game background
    updateBackground(state: any, action: PayloadAction<string>) {
      return { ...state, background: action.payload };
    },
    // Update game effect
    updateEffect(state: any, action: PayloadAction<string>) {
      return { ...state, effect: action.payload };
    },
    // Update game audio
    updateAudio(state: any, action: PayloadAction<string>) {
      return { ...state, audio: action.payload };
    },
    // Update current tool
    switchTool(state: any, action: PayloadAction<Tool>) {
      return { ...state, tool: action.payload };
    },
    // Update selected object
    select(state: any, action: PayloadAction<string>) {
      return { ...state, selected: action.payload };
    },
    // Update dialog state
    dialogOpened(state: any, action: PayloadAction<dialogState>) {
      return { ...state, dialogOpen: action.payload };
    },
    // Reset the canvas to initial state
    reset() {
      return { ...initialState, modeSwitch: 'pending' };
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

// Use throughout app instead of useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const reducer = combineReducers({
  canvas: canvasSlice.reducer,
  entities: entitiesSlice.reducer,
});

// Create selectors based on the location of this entity state
const entitiesSelectors = entitiesAdapter.getSelectors<RootState>(
  (state) => state.entities
);

// Configure store for export
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

// Get an entity by its id
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
