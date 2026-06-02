"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useAddress } from "@/hooks/useAddress";
import { MapPinIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="addresses-tab">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          My Addresses
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-neutral-900 dark:bg-white cursor-pointer text-white dark:text-neutral-900 px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address: any) => (
            <div
              key={address.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col h-full hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <MapPinIcon className="w-6 h-6 text-neutral-900 dark:text-white" />
                <div className="flex items-center gap-3">
                  {(address.defaultAddress || address.isDefault ) && (
                    <span className="bg-neutral-900 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                      Default
                    </span>
                  ) }
                  <button
                    onClick={() => handleEditClick(address)}
                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Edit Address"
                  >
                    <PencilSquareIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(address)}
                    disabled={deletingId !== null}
                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Address"
                  >
                    <TrashIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                    {address.firstName} {address.lastName}
                  </h3>
                </div>
                
                <div className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-normal">
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} {address.postcode} | {address.phone}
                  </p>
                </div>
              </div>
            </div>
          ))}
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

      {/* Add Address Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer dark:hover:text-neutral-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    City *
                  </label>
                  <input
                    {...register("city", { required: "City is required" })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Country *
                  </label>
                  <input
                    {...register("country", {
                      required: "Country is required",
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
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
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label
                  htmlFor="defaultAddress"
                  className="text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border cursor-pointer border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-neutral-900 cursor-pointer dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  {creating
                    ? "Saving..."
                    : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
