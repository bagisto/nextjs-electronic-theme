"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { useAppSelector } from "@/store/hooks";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { useCustomToast } from "@/hooks/useToast";
import { useScrollTo } from "@/hooks";
import CustomDatePicker from "@/components/common/form/CustomDatePicker";
import CustomDropdown from "@/components/common/form/CustomDropdown";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollTo = useScrollTo();
  const user = useAppSelector((state) => state.user.user);
  const { showToast } = useCustomToast();

  const {
    profile,
    formData,
    setFormData,
    isLoading,
    isSaving,
    isUploadingImage,
    error,
    updateProfile,
    updateProfileImage,
  } = useCustomerProfile();

  const currentImage = imagePreview || profile?.image || user?.image || "";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Please upload a JPG, PNG, or WebP image", "warning");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast("Image must be smaller than 2MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      const success = await updateProfileImage(base64);
      if (!success) {
        setImagePreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const customerProfile = profile || {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: user?.gender || "",
    dateOfBirth: user?.dateOfBirth || "",
    email: user?.email || "",
    phone: user?.phone || "",
    status: "",
    subscribedToNewsLetter: false,
    isVerified: false,
  };

  if (isLoading) {
    return (
      <div className="profile-tab bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-full"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-tab bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
        <div className="text-red-500 text-center py-8">{error}</div>
      </div>
    );
  }

  const avatarCircle = (
    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
      {currentImage ? (
        <Image
          src={currentImage}
          alt={user?.name || "Profile"}
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        <UserIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
      )}
      {isUploadingImage && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        </div>
      )}
    </div>
  );

  const readOnlyImageBlock = (
    <div className="flex items-center gap-6 mb-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
      {avatarCircle}
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Click <span className="font-semibold text-neutral-700 dark:text-neutral-300">Edit Profile</span> below to change your photo.
      </p>
    </div>
  );

  const editableImageBlock = (
    <div className="flex items-center gap-6 mb-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
      {avatarCircle}
      <div>
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={isUploadingImage}
          className="bg-neutral-900 dark:bg-white cursor-pointer text-white dark:text-neutral-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploadingImage ? "Uploading..." : currentImage ? "Change Photo" : "Upload Photo"}
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          JPG, PNG or WebP. Max 2MB.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
    </div>
  );

  if (!isEditing) {
    return (
      <div className="profile-tab bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
          Profile
        </h2>

        {readOnlyImageBlock}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <dt className="font-semibold text-neutral-900 dark:text-white md:col-span-1">
              First Name
            </dt>
            <dd className="text-neutral-700 dark:text-neutral-300 md:col-span-2">
              {customerProfile.firstName &&
              customerProfile.firstName.trim() !== ""
                ? customerProfile.firstName
                : "-"}
            </dd>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <dt className="font-semibold text-neutral-900 dark:text-white md:col-span-1">
              Last Name
            </dt>
            <dd className="text-neutral-700 dark:text-neutral-300 md:col-span-2">
              {customerProfile.lastName &&
              customerProfile.lastName.trim() !== ""
                ? customerProfile.lastName
                : "-"}
            </dd>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <dt className="font-semibold text-neutral-900 dark:text-white md:col-span-1">
              Gender
            </dt>
            <dd className="text-neutral-700 dark:text-neutral-300 md:col-span-2">
              {customerProfile.gender && customerProfile.gender.trim() !== ""
                ? customerProfile.gender
                : "-"}
            </dd>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <dt className="font-semibold text-neutral-900 dark:text-white md:col-span-1">
              Date of Birth
            </dt>
            <dd className="text-neutral-700 dark:text-neutral-300 md:col-span-2">
              {customerProfile.dateOfBirth &&
              customerProfile.dateOfBirth.trim() !== ""
                ? customerProfile.dateOfBirth
                : "-"}
            </dd>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <dt className="font-semibold text-neutral-900 dark:text-white md:col-span-1">
              Email
            </dt>
            <dd className="text-neutral-700 dark:text-neutral-300 md:col-span-2">
              {customerProfile.email && customerProfile.email.trim() !== ""
                ? customerProfile.email
                : "-"}
            </dd>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <dt className="font-semibold text-neutral-900 dark:text-white md:col-span-1">
              Phone
            </dt>
            <dd className="text-neutral-700 dark:text-neutral-300 md:col-span-2">
              {customerProfile.phone && customerProfile.phone.trim() !== ""
                ? customerProfile.phone
                : "-"}
            </dd>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              setIsEditing(true);
              scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-neutral-900 dark:bg-white cursor-pointer text-white dark:text-neutral-900 px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm hover:shadow-md"
          >
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-tab bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Edit Profile
        </h2>
      </div>

      {editableImageBlock}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Gender
            </label>
            <CustomDropdown
              name="gender"
              value={formData.gender}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, gender: v }))
              }
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
              placeholder="Select Gender"
              ariaLabel="Gender"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Date of Birth
            </label>
            <CustomDatePicker
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, dateOfBirth: v }))
              }
              max={new Date().toISOString().slice(0, 10)}
              placeholder="Select date of birth"
              size="md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent transition-all"
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-neutral-900 dark:bg-white cursor-pointer text-white dark:text-neutral-900 px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              // Reset form data to original profile values when canceling
              setFormData({
                firstName: profile?.firstName || user?.firstName || "",
                lastName: profile?.lastName || user?.lastName || "",
                email: profile?.email || user?.email || "",
                dateOfBirth: profile?.dateOfBirth || user?.dateOfBirth || "",
                gender: profile?.gender || user?.gender || "",
                phone: profile?.phone || user?.phone || "",
              });
              setIsEditing(false);
            }}
            disabled={isSaving}
            className="bg-white dark:bg-neutral-800 border cursor-pointer border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-8 py-3 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
