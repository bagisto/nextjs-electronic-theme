"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/user-slice";
import { useCustomToast } from "./useToast";
import { GET_CUSTOMER_PROFILE } from "@/graphql/customer/queries/GetCustomerProfile";
import { UPDATE_CUSTOMER_PROFILE } from "@/graphql/customer/mutations/UpdateCustomerProfile";

export interface CustomerProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    status: string;
    subscribedToNewsLetter: boolean;
    isVerified: boolean;
    image: string;
}

export interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    image?: string;
}

interface UseCustomerProfileReturn {
    profile: CustomerProfile | null;
    formData: ProfileFormData;
    isLoading: boolean;
    isSaving: boolean;
    isUploadingImage: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateProfile: (data: ProfileFormData) => Promise<boolean>;
    updateProfileImage: (imageBase64: string) => Promise<boolean>;
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const useCustomerProfile = (): UseCustomerProfileReturn => {
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
    });
    const [error, setError] = useState<string | null>(null);

    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;
    const dispatch = useAppDispatch();

    const { loading: isLoading, refetch } = useQuery(GET_CUSTOMER_PROFILE, {
        skip: !isLoggedIn,
        fetchPolicy: "cache-and-network",
        onCompleted: (data) => {
            const profileData = data?.readCustomerProfile;
            if (profileData) {
                setProfile(profileData);
                // Update Redux state with full profile data
                dispatch(setUser({ ...user, ...profileData }));
                setFormData({
                    firstName: profileData?.firstName || "",
                    lastName: profileData?.lastName || "",
                    email: profileData?.email || "",
                    dateOfBirth: profileData?.dateOfBirth || "",
                    gender: profileData?.gender || "",
                    phone: profileData?.phone || "",
                });
            }
        },
        onError: (err) => {
            console.error("Error fetching customer profile:", err);
            setError("Failed to load profile data");
        }
    });

    const [updateProfileMutation, { loading: isSaving }] = useMutation(UPDATE_CUSTOMER_PROFILE, {
        onCompleted: (response) => {
            const updatedProfile = response?.createCustomerProfileUpdate?.customerProfileUpdate;
            if (updatedProfile) {
                setProfile(updatedProfile);
                // Update Redux user state with the new profile data
                dispatch(setUser({ ...user, ...updatedProfile }));
                showToast("Profile updated successfully!", "success");
            } else {
                showToast("Failed to update profile", "danger");
            }
        },
        onError: (err: any) => {
            const message = err?.message || "Something went wrong";
            showToast(message, "danger");
        }
    });

    const [updateProfileImageMutation, { loading: isUploadingImage }] = useMutation(UPDATE_CUSTOMER_PROFILE, {
        onCompleted: (response) => {
            const updatedProfile = response?.createCustomerProfileUpdate?.customerProfileUpdate;
            if (updatedProfile) {
                setProfile((prev) => (prev ? { ...prev, image: updatedProfile.image } : prev));
                if (user) {
                    dispatch(setUser({ ...user, image: updatedProfile.image }));
                }
                showToast("Profile image updated successfully!", "success");
            } else {
                showToast("Failed to update profile image", "danger");
            }
        },
        onError: (err: any) => {
            const message = err?.message || "Something went wrong";
            showToast(message, "danger");
        }
    });

    const fetchCustomerProfile = useCallback(async () => {
        try {
            await refetch();
        } catch (err) {
            console.error("Error refetching customer profile:", err);
            setError("Failed to load profile data");
        }
    }, [refetch]);

    const updateProfile = useCallback(async (data: ProfileFormData): Promise<boolean> => {
        if (!isLoggedIn) {
            showToast("Please login to update profile", "warning");
            return false;
        }

        try {
            const input: Record<string, unknown> = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                phone: data.phone,
            };
            if (data.image) {
                input.image = data.image;
            }
            await updateProfileMutation({ variables: { input } });
            return true;
        } catch (e) {
            console.error(e, "error");
            return false;
        }
    }, [isLoggedIn, updateProfileMutation, showToast]);

    const updateProfileImage = useCallback(async (imageBase64: string): Promise<boolean> => {
        if (!isLoggedIn) {
            showToast("Please login to update profile image", "warning");
            return false;
        }
        if (!imageBase64) {
            showToast("Please select an image", "warning");
            return false;
        }

        try {
            await updateProfileImageMutation({
                variables: {
                    input: {
                        firstName: profile?.firstName ?? user?.firstName ?? "",
                        lastName: profile?.lastName ?? user?.lastName ?? "",
                        email: profile?.email ?? user?.email ?? "",
                        image: imageBase64,
                    }
                }
            });
            return true;
        } catch (e) {
            console.error(e, "profile image update error");
            return false;
        }
    }, [isLoggedIn, updateProfileImageMutation, showToast, profile, user]);

    return {
        profile,
        formData,
        isLoading,
        isSaving,
        isUploadingImage,
        error,
        refetch: fetchCustomerProfile,
        updateProfile,
        updateProfileImage,
        setFormData,
    };
};
