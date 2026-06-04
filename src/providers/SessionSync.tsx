"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { mergeUser, clearUser } from "@/store/slices/user-slice";
import {
    setWishlistIds,
    seedWishlistIds,
    clearWishlist,
} from "@/store/slices/wishlist-slice";
import {
    setCompareIds,
    seedCompareIds,
    clearCompare,
} from "@/store/slices/compare-slice";
import { GET_CUSTOMER_PROFILE } from "@/graphql/customer/queries/GetCustomerProfile";
import { GET_ALL_WISHLIST } from "@/graphql/wishlist/query/GetAllWishList";
import { GET_COMPARE_ITEMS } from "@/graphql/catalog/queries/CompareItems";
import {
    WISHLIST_IDS,
    COMPARE_IDS,
    userScopedKey,
    getLocalStorage,
    setLocalStorage,
} from "@/store/local-storage";
import { normalizeProductId } from "@/utils/productId";
import { FULL_LIST_SIZE } from "@/utils/constants";

const extractIds = (edges: any[] | undefined): number[] =>
    (edges || [])
        .map((edge) => edge?.node?.product?.id)
        .filter((id) => id != null)
        .map((id) => normalizeProductId(id))
        .filter((id) => !Number.isNaN(id));

export const SessionSync = () => {
    const { data: session, status } = useSession();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.user);
    const wishlistIds = useAppSelector((state) => state.wishlist.ids);
    const compareIds = useAppSelector((state) => state.compare.ids);
    const wishlistHydrated = useAppSelector((state) => state.wishlist.hydrated);
    const compareHydrated = useAppSelector((state) => state.compare.hydrated);
    const email = user?.email ?? null;
    const isAuthenticated = status === "authenticated";

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            dispatch(mergeUser(session.user as any));
        } else if (status === "unauthenticated") {
            dispatch(clearUser());
            dispatch(clearWishlist());
            dispatch(clearCompare());
        }
    }, [session, status, dispatch]);
    useEffect(() => {
        if (!email) return;
        const cachedWishlist = getLocalStorage(userScopedKey(WISHLIST_IDS, email), true);
        const cachedCompare = getLocalStorage(userScopedKey(COMPARE_IDS, email), true);
        if (Array.isArray(cachedWishlist)) dispatch(seedWishlistIds(cachedWishlist));
        if (Array.isArray(cachedCompare)) dispatch(seedCompareIds(cachedCompare));
    }, [email, dispatch]);
    const { data: profileData } = useQuery(GET_CUSTOMER_PROFILE, {
        skip: status !== "authenticated",
        fetchPolicy: "cache-and-network",
    });

    const { data: wishlistData } = useQuery(GET_ALL_WISHLIST, {
        skip: !isAuthenticated,
        fetchPolicy: "cache-and-network",
        variables: { first: FULL_LIST_SIZE },
    });

    const { data: compareData } = useQuery(GET_COMPARE_ITEMS, {
        skip: !isAuthenticated,
        fetchPolicy: "cache-and-network",
        variables: { first: FULL_LIST_SIZE },
    });

    useEffect(() => {
        const profile = profileData?.readCustomerProfile;
        if (profile) {
            dispatch(mergeUser(profile as any));
        }
    }, [profileData, dispatch]);

    useEffect(() => {
        if (wishlistData) {
            dispatch(setWishlistIds(extractIds(wishlistData?.wishlists?.edges)));
        }
    }, [wishlistData, dispatch]);

    useEffect(() => {
        if (compareData) {
            dispatch(setCompareIds(extractIds(compareData?.compareItems?.edges)));
        }
    }, [compareData, dispatch]);

    useEffect(() => {
        if (!email || !wishlistHydrated) return;
        setLocalStorage(userScopedKey(WISHLIST_IDS, email), wishlistIds);
    }, [email, wishlistHydrated, wishlistIds]);

    useEffect(() => {
        if (!email || !compareHydrated) return;
        setLocalStorage(userScopedKey(COMPARE_IDS, email), compareIds);
    }, [email, compareHydrated, compareIds]);

    return null;
}
