"use client";

import {
  UserIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import { useAppSelector } from "@/store/hooks";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { useScrollTo } from "@/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import CustomDatePicker from "@/components/common/form/CustomDatePicker";
import CustomDropdown from "@/components/common/form/CustomDropdown";

export default function ProfileTab() {
  const scrollTo = useScrollTo();
  const user = useAppSelector((state) => state.user.user);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    profile,
    formData,
    setFormData,
    isLoading,
    isSaving,
    error,
    updateProfile,
  } = useCustomerProfile();

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
      onClose();
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
      <div className="profile-tab max-w-lg w-full mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8 md:p-8 lg:p-0 lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent">
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
      <div className="profile-tab max-w-lg w-full mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8 md:p-8 lg:p-0 lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent">
        <div className="text-red-500 text-center py-8">{error}</div>
      </div>
    );
  }

  const profileFields = [
    { label: "First Name", value: customerProfile.firstName, Icon: UserIcon },
    { label: "Last Name", value: customerProfile.lastName, Icon: UserIcon },
    { label: "Gender", value: customerProfile.gender, Icon: IdentificationIcon },
    {
      label: "Date of Birth",
      value: customerProfile.dateOfBirth,
      Icon: CalendarDaysIcon,
    },
    { label: "Email", value: customerProfile.email, Icon: EnvelopeIcon },
    { label: "Phone", value: customerProfile.phone, Icon: PhoneIcon },
  ];

  return (
    <>
      <div className="profile-tab max-w-lg w-full mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8 md:p-8 lg:p-0 lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Profile Information
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Manage your personal details and account information.
            </p>
          </div>
          <button
            onClick={() => {
              onOpen();
              scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex shrink-0 items-center gap-2 cursor-pointer border border-green-500 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="flex flex-col">
          {profileFields.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 xs:gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
            >
              <div className="flex shrink-0 items-center justify-center w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
              </div>
              <span className="w-24 xs:w-28 sm:w-36 shrink-0 text-xs xs:text-sm text-neutral-500 dark:text-neutral-400">
                {label}
              </span>
              <span className="text-xs xs:text-sm font-semibold text-neutral-900 dark:text-white break-all min-w-0">
                {value && value.trim() !== "" ? value : "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        classNames={{
          backdrop: "bg-black/50",
          base: "mx-2 my-2 sm:mx-4 max-h-[90dvh] sm:max-h-[90vh]",
        }}
      >
        <ModalContent className="p-4">
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Edit Profile
                  </h2>
                  <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400 mt-1">
                    Update your personal details and account information.
                  </p>
                </div>
              </ModalHeader>

              <ModalBody className="pb-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto bg-green-500 text-white border border-green-500 cursor-pointer px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
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
                        onClose();
                      }}
                      disabled={isSaving}
                      className="w-full sm:w-auto bg-white dark:bg-neutral-800 border cursor-pointer border-green-500 text-green-600 dark:text-green-400 px-8 py-3 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
