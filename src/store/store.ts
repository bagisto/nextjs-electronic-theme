import { configureStore } from "@reduxjs/toolkit";

import cartSlice from "./slices/cart-slice";
import userSlice from "./slices/user-slice";
import wishlistSlice from "./slices/wishlist-slice";
import compareSlice from "./slices/compare-slice";

export const store = configureStore({
  reducer: {
    cartDetail: cartSlice,
    user: userSlice,
    wishlist: wishlistSlice,
    compare: compareSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
