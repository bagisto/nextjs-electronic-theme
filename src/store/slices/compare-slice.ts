import { PayloadAction, createSlice } from "@reduxjs/toolkit";

/**
 * Lightweight membership store for the compare list — mirror of the wishlist
 * slice. Holds only the set of compared product ids (as numbers); the full
 * compare listing with product data + pagination still comes from Apollo.
 */
interface CompareState {
  ids: number[];
  /** True once hydrated from network (vs. only localStorage / empty). */
  hydrated: boolean;
}

const initialState: CompareState = {
  ids: [],
  hydrated: false,
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    setCompareIds: (state, action: PayloadAction<number[]>) => {
      state.ids = Array.from(new Set(action.payload));
      state.hydrated = true;
    },
    seedCompareIds: (state, action: PayloadAction<number[]>) => {
      if (!state.hydrated) {
        state.ids = Array.from(new Set(action.payload));
      }
    },
    addCompareId: (state, action: PayloadAction<number>) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
      }
    },
    removeCompareId: (state, action: PayloadAction<number>) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    clearCompare: (state) => {
      state.ids = [];
      state.hydrated = false;
    },
  },
});

export const {
  setCompareIds,
  seedCompareIds,
  addCompareId,
  removeCompareId,
  clearCompare,
} = compareSlice.actions;

export default compareSlice.reducer;
