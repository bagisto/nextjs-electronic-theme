import { PayloadAction, createSlice } from "@reduxjs/toolkit";

/**
 * Lightweight membership store for the wishlist: holds only the set of
 * wishlisted product ids (as numbers). The full wishlist listing — with
 * product data and pagination — still comes from Apollo. This slice exists so
 * every product card / badge can answer "is this wishlisted?" in O(1) from a
 * single shared source, render instantly on first paint (hydrated from
 * localStorage), and stay in sync across components via optimistic updates.
 */
interface WishlistState {
  ids: number[];
  /** True once hydrated from network (vs. only localStorage / empty). */
  hydrated: boolean;
}

const initialState: WishlistState = {
  ids: [],
  hydrated: false,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    /** Replace the full membership set (network hydrate or revalidation). */
    setWishlistIds: (state, action: PayloadAction<number[]>) => {
      state.ids = Array.from(new Set(action.payload));
      state.hydrated = true;
    },
    /** Optimistically seed membership from localStorage without marking hydrated. */
    seedWishlistIds: (state, action: PayloadAction<number[]>) => {
      if (!state.hydrated) {
        state.ids = Array.from(new Set(action.payload));
      }
    },
    addWishlistId: (state, action: PayloadAction<number>) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
      }
    },
    removeWishlistId: (state, action: PayloadAction<number>) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    clearWishlist: (state) => {
      state.ids = [];
      state.hydrated = false;
    },
  },
});

export const {
  setWishlistIds,
  seedWishlistIds,
  addWishlistId,
  removeWishlistId,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
