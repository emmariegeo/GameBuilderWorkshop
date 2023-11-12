import { PayloadAction, configureStore, createSlice, createEntityAdapter, combineReducers, createSelector } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { Entity, EntityType, Tool } from "./data/types";

let player: Entity = { id: 'player', x: 100, y: 450, z: 1, width: 32, height: 32, scale: 1, orientation: 0, spriteUrl: '../assets/sprites/pinkman.png', physics: 'arcade', type: EntityType.Player, loaded: false }

const initialState: { mode: string, background: string, tool: Tool, selected: string } = {
  mode: 'edit', background: 'bg1', tool: Tool.Select, selected: ''
};

// Normalizing game object data
const entitiesAdapter = createEntityAdapter<Entity>({
  selectId: (entity) => entity.id,
})

// REDUCER for Entities
const entitiesSlice = createSlice({
  name: 'entities',
  initialState: entitiesAdapter.getInitialState(),
  reducers: {
    // Can pass adapter functions directly as case reducers.  Because we're passing this
    // as a value, `createSlice` will auto-generate the `entityAdded` action type / creator
    entityAdded: entitiesAdapter.setOne,
    entityDeleted: entitiesAdapter.removeOne,
    entityUpdated: entitiesAdapter.updateOne,
    entityLoaded(state, action) {
      if (action.payload.loaded == false) {
        entitiesAdapter.updateOne(state, { id: action.payload.id, changes: { loaded: false } })
      }
    },
    entityUpdateXYZ(state, action: { payload: {id: string, position: { x: number, y: number, z: number }}}) {
      entitiesAdapter.updateOne(state, { id: action.payload.id, changes: { x: action.payload.position.x, y: action.payload.position.y, z: action.payload.position.z, } })
    },
    entitiesReceived(state, action) {
      // Or, call them as "mutating" helpers in a case reducer
      entitiesAdapter.setAll(state, action.payload.entities)
    },
  },
});

// REDUCER
const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    switchMode(state: any, action: PayloadAction<string>) {
      return { ...state, mode: action.payload }
    },
    updateBackground(state: any, action: PayloadAction<string>) {
      return { ...state, background: action.payload };
    },
    switchTool(state: any, action: PayloadAction<Tool>) {
      return { ...state, tool: action.payload };
    },
    select(state: any, action: PayloadAction<string>) {
      return { ...state, selected: action.payload };
    }
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const reducer = combineReducers({
  canvas: canvasSlice.reducer,
  entities: entitiesSlice.reducer,
})

// Can create a set of memoized selectors based on the location of this entity state
const entitiesSelectors = entitiesAdapter.getSelectors<RootState>(
  (state) => state.entities,
)
export const store = configureStore({ reducer: reducer });
// And then use the selectors to retrieve values
export const allEntities = entitiesSelectors.selectAll(store.getState())
export const entityById = (id: string) => { return entitiesSelectors.selectById(store.getState(), id)};

export const { switchMode, updateBackground, switchTool, select } = canvasSlice.actions;
export const { entityAdded, entityLoaded, entityUpdated, entityDeleted, entityUpdateXYZ } = entitiesSlice.actions;