import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BagistoUser } from "@/types/types";

interface UserState {
    user: BagistoUser | null;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<BagistoUser>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        mergeUser: (state, action: PayloadAction<Partial<BagistoUser>>) => {
            state.user = { ...(state.user ?? {}), ...action.payload } as BagistoUser;
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, mergeUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
