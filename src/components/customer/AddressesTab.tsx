"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useAddress } from "@/hooks/useAddress";
import { MapPinIcon, PencilSquareIcon, TrashIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import Pagination from "@/components/catalog/Pagination";
import { ADDRESSES_ITEMS_PER_PAGE } from "@/utils/constants";

interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  defaultAddress: boolean;
}

export default function AddressesTab() {
  const searchParams = useSearchParams();

  const currentPage = searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0;
  const after = searchParams.get("cursor");
  const before = searchParams.get("before");

  const { addresses, totalCount, pageInfo, loading, createAddress, deleteAddress, creating } =
    useAddress({
      pageSize: ADDRESSES_ITEMS_PER_PAGE,
      page: currentPage,
      after,
      before,
    });
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "US",
      postcode: "",
      defaultAddress: false,
    },
  });

  const handleEditClick = (address: any) => {
    setEditingAddress(address);
    setValue("firstName", address.firstName || "");
    setValue("lastName", address.lastName || "");
    setValue("email", address.email || "");
    setValue("phone", address.phone || "");
    setValue("address1", address.address || "");
    setValue("address2", address.address2 || "");
    setValue("city", address.city || "");
    setValue("state", address.state || "");
    setValue("country", address.country || "US");
    setValue("postcode", address.postcode || "");
    setValue("defaultAddress", address.defaultAddress === true || address.isDefault === true);
    setShowForm(true);
  };

  const handleDeleteClick = async (address: any) => {
    const addressId = address.id?.split("/").pop() || address.id;
    setDeletingId(addressId);
    await deleteAddress(addressId);
    setDeletingId(null);
  };
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSetDefault = async (address: any) => {
    const addressId = address.id?.split("/").pop() || address.id;
    setSettingDefaultId(addressId);
    await createAddress(
      {
        firstName: address.firstName,
        lastName: address.lastName,
        email: address.email,
        phone: address.phone,
        address1: address.address,
        address2: address.address2 || "",
        city: address.city,
        state: address.state,
        country: address.country,
        postcode: address.postcode,
        defaultAddress: true,
      },
      addressId,
    );
    setSettingDefaultId(null);
  };

  const onSubmit = async (data: AddressFormData) => {
    const input = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      country: data.country,
      postcode: data.postcode,
      defaultAddress: data.defaultAddress ? true : false,
    };

    let addressId: string | undefined;
    if (editingAddress?.id) {
      const parts = editingAddress.id.split("/");
      addressId = parts[parts.length - 1];
    }

    await createAddress(input, addressId);
    reset();
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleClose = () => {
    reset();
    setEditingAddress(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="addresses-tab">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            My Addresses
          </h2>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="addresses-tab">
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3 mb-8 sm:mb-10">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            My Addresses
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your saved addresses
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 cursor-pointer text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap self-start xs:self-auto"
        >
          + Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            No addresses saved yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {addresses.map((address: any) => {
            const isDefault = address.defaultAddress || address.isDefault;
            const typeLabel =
              address.addressType &&
              address.addressType.toLowerCase() !== "customer"
                ? address.addressType
                : null;
            return (
              <div
                key={address.id}
                className={`bg-white dark:bg-neutral-900 rounded-xl border p-5 sm:p-6 flex flex-col h-full transition-all hover:shadow-md ${
                  isDefault
                    ? "border-green-500 ring-1 ring-green-500/40"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-5">
                  <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isDefault && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full">
                        Default
                      </span>
                    )}
                    <button
                      onClick={() => handleEditClick(address)}
                      className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(address)}
                      disabled={deletingId !== null}
                      className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-red-400 hover:text-red-500 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Address"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                      {address.firstName} {address.lastName}
                    </h3>
                    {typeLabel && (
                      <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] capitalize font-medium px-2 py-0.5 rounded-full">
                        {typeLabel}
                      </span>
                    )}
                  </div>

                  <div className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-normal break-words">
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} {address.postcode} |{" "}
                      {address.phone}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addresses.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 sm:p-5">
          <div className="flex shrink-0 items-center justify-center w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Your addresses are secure
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              We use industry-standard encryption to protect your personal
              information.
            </p>
          </div>
        </div>
      )}

      {totalCount > ADDRESSES_ITEMS_PER_PAGE && (
        <div className="mt-10">
          <Pagination
            itemsPerPage={ADDRESSES_ITEMS_PER_PAGE}
            itemsTotal={totalCount}
            currentPage={currentPage}
            nextCursor={pageInfo?.endCursor}
            prevCursor={pageInfo?.startCursor}
          />
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={showForm}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        classNames={{
          backdrop: "bg-black/50",
          base: "mx-2 my-2 sm:mx-4 max-h-[90dvh] sm:max-h-[90vh]",
        }}
      >
        <ModalContent className="p-4">
          <ModalHeader className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400 mt-1">
                Enter your shipping and contact details below.
              </p>
            </div>
          
          </ModalHeader>

          <ModalBody className="pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Phone *
                </label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Address Line 1 *
                </label>
                <input
                  {...register("address1", { required: "Address is required" })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                {errors.address1 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address1.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Address Line 2
                </label>
                <input
                  {...register("address2")}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    City *
                  </label>
                  <input
                    {...register("city", { required: "City is required" })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    State *
                  </label>
                  <input
                    {...register("state", { required: "State is required" })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Country *
                  </label>
                  <input
                    {...register("country", {
                      required: "Country is required",
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Postcode *
                  </label>
                  <input
                    {...register("postcode", {
                      required: "Postcode is required",
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {errors.postcode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postcode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  {...register("defaultAddress")}
                  className="w-4 h-4 rounded border-neutral-300 text-green-600 accent-green-600 focus:ring-green-500"
                />
                <label
                  htmlFor="defaultAddress"
                  className="text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Set as default address
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:flex-1 px-4 py-2.5 border cursor-pointer border-green-500 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-green-500 cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {creating
                    ? "Saving..."
                    : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
