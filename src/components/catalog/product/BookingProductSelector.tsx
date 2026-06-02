"use client";

import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { MinusIcon, PlusIcon } from "@/components/common/icons/CartIcons";
import {
  GET_BOOKING_SLOTS,
  GET_RENTAL_BOOKING_SLOTS,
} from "@/graphql/catalog/queries/BookingSpecificQueries";
import CustomDatePicker from "@/components/common/form/CustomDatePicker";
import CustomDropdown, {
  type DropdownOption,
} from "@/components/common/form/CustomDropdown";

export type BookingSubType =
  | "appointment"
  | "event"
  | "table"
  | "rental"
  | "default";

export type BookingSelection =
  | { type: "appointment"; date: string; slot: string }
  | { type: "table"; date: string; slot: string }
  | { type: "default"; date: string; slot: string }
  | {
      type: "rental";
      renting_type: "daily";
      date_from: string;
      date_to: string;
    }
  | { type: "rental"; renting_type: "hourly"; date: string; slot: string }
  | { type: "event"; qty: Record<string, number> }
  | null;

export type BookingProductNode = {
  _id: number | string;
  type: BookingSubType;
  location?: string;
  availableFrom?: string;
  availableTo?: string;
  availableEveryWeek?: boolean | string;
  qty?: number;
  appointmentSlot?: {
    duration?: number;
    breakTime?: number;
    sameSlotAllDays?: boolean;
    slots?: any;
  };
  tableSlot?: {
    duration?: number;
    breakTime?: number;
    guestLimit?: number;
    priceType?: string;
    preventSchedulingBefore?: number;
    sameSlotAllDays?: boolean;
    slots?: any;
  };
  rentalSlot?: {
    rentingType?: string;
    dailyPrice?: number | string;
    hourlyPrice?: number | string;
    slots?: any;
  };
  defaultSlot?: {
    bookingType?: string;
    duration?: number;
    breakTime?: number;
    slots?: any;
  };
  eventTickets?: {
    edges: {
      node: {
        _id: number | string;
        formattedPrice?: string;
        translation?: { name?: string; description?: string };
        name?: string;
        description?: string;
      };
    }[];
  };
};

export type BookingSlotMeta = {
  loading: boolean;
  noSlotsForDate: boolean;
  selectedSlotQty: number | null;
};

interface Props {
  bookingProduct: BookingProductNode | null | undefined;
  ticketQuantities: Record<string, number>;
  onTicketQuantityChange: (ticketId: string | number, change: number) => void;
  selection: BookingSelection;
  onSelectionChange: (next: BookingSelection) => void;
  bookingNote: string;
  onBookingNoteChange: (note: string) => void;
  onSlotMetaChange?: (meta: BookingSlotMeta) => void;
}

type SlotResult = {
  slotId: string | number | null;
  from?: string;
  to?: string;
  timestamp?: string;
  time?: string;
  slots?: any[];
  qty?: number | null;
};

function getSlotKey(s: SlotResult, fallbackIndex: number): string {
  if (s.timestamp) return s.timestamp;
  if (s.slotId !== null && s.slotId !== undefined) return String(s.slotId);
  return `slot-${fallbackIndex}`;
}

export function BookingProductSelector({
  bookingProduct,
  ticketQuantities,
  onTicketQuantityChange,
  selection,
  onSelectionChange,
  bookingNote,
  onBookingNoteChange,
  onSlotMetaChange,
}: Props) {
  const [selectedDate, setSelectedDate] = useState("");
  const [rentingType, setRentingType] = useState<"daily" | "hourly">("daily");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const numericId =
    typeof bookingProduct?._id === "number"
      ? bookingProduct._id
      : parseInt(String(bookingProduct?._id || 0), 10);

  const [fetchSlots, { data: slotData, loading: slotLoading }] =
    useLazyQuery<{ bookingSlots: SlotResult[] }>(GET_BOOKING_SLOTS);

  const [fetchRentalSlots, { data: rentalSlotData, loading: rentalLoading }] =
    useLazyQuery<{ bookingSlots: SlotResult[] }>(GET_RENTAL_BOOKING_SLOTS);

  useEffect(() => {
    if (!selectedDate || !numericId) return;
    if (bookingProduct?.type === "rental" && rentingType === "hourly") {
      fetchRentalSlots({
        variables: { id: numericId, date: selectedDate },
      });
    } else if (
      bookingProduct?.type === "appointment" ||
      bookingProduct?.type === "table" ||
      bookingProduct?.type === "default"
    ) {
      fetchSlots({ variables: { id: numericId, date: selectedDate } });
    }
  }, [
    selectedDate,
    numericId,
    bookingProduct?.type,
    rentingType,
    fetchRentalSlots,
    fetchSlots,
  ]);

  const activeSlotData =
    bookingProduct?.type === "rental" && rentingType === "hourly"
      ? rentalSlotData?.bookingSlots
      : slotData?.bookingSlots;
  const activeLoading =
    bookingProduct?.type === "rental" && rentingType === "hourly"
      ? rentalLoading
      : slotLoading;

  const flatSlotCount = (() => {
    if (!activeSlotData?.length) return 0;
    if (bookingProduct?.type === "rental" && rentingType === "hourly") {
      return activeSlotData.reduce(
        (sum, s) => sum + (s.slots?.length || 0),
        0
      );
    }
    return activeSlotData.length;
  })();

  const selectedSlotValue =
    selection &&
    "type" in selection &&
    "slot" in selection &&
    typeof (selection as any).slot === "string"
      ? (selection as any).slot
      : "";

  const selectedSlotQty = (() => {
    if (!selectedSlotValue || !activeSlotData?.length) return null;
    for (const s of activeSlotData) {
      const key = s.timestamp
        ? String(s.timestamp)
        : s.slotId !== null && s.slotId !== undefined
        ? String(s.slotId)
        : "";
      if (key && key === selectedSlotValue && typeof s.qty === "number") {
        return s.qty;
      }
      for (const inner of s.slots || []) {
        const innerKey =
          typeof inner === "string"
            ? inner
            : inner?.from && inner?.to
            ? `${inner.from} - ${inner.to}`
            : inner?.timestamp
            ? String(inner.timestamp)
            : "";
        if (
          innerKey &&
          innerKey === selectedSlotValue &&
          typeof inner?.qty === "number"
        ) {
          return inner.qty;
        }
      }
    }
    return null;
  })();

  useEffect(() => {
    if (!onSlotMetaChange) return;
    onSlotMetaChange({
      loading: !!activeLoading,
      noSlotsForDate: !!selectedDate && !activeLoading && flatSlotCount === 0,
      selectedSlotQty,
    });
  }, [
    onSlotMetaChange,
    activeLoading,
    selectedDate,
    flatSlotCount,
    selectedSlotQty,
  ]);

  if (!bookingProduct) return null;
  const sub = bookingProduct.type;

  if (sub === "event") {
    const ticketEdges = bookingProduct.eventTickets?.edges || [];
    if (!ticketEdges.length) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
          Book Your Ticket
        </h3>
        <div className="space-y-3">
          {ticketEdges.map((edge) => {
            const ticket = edge.node;
            const qty = ticketQuantities[String(ticket._id)] || 1;
            return (
              <div
                key={String(ticket._id)}
                className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {ticket.translation?.name || ticket.name}
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {ticket.translation?.description || ticket.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-700 p-1 rounded-lg border border-neutral-200 dark:border-neutral-600">
                    <button
                      type="button"
                      onClick={() => onTicketQuantityChange(ticket._id, -1)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded cursor-pointer"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900 dark:text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onTicketQuantityChange(ticket._id, 1)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">
                    {ticket.formattedPrice}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Per Ticket
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (sub === "rental") {
    const switchTo = (next: "daily" | "hourly") => {
      setRentingType(next);
      if (next === "daily") {
        onSelectionChange({
          type: "rental",
          renting_type: "daily",
          date_from: dateFrom,
          date_to: dateTo,
        });
      } else {
        onSelectionChange({
          type: "rental",
          renting_type: "hourly",
          date: selectedDate,
          slot: "",
        });
      }
    };
    const hourlySelectedSlot =
      selection &&
      "type" in selection &&
      selection.type === "rental" &&
      selection.renting_type === "hourly"
        ? (selection as any).slot
        : "";

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchTo("daily")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer ${
              rentingType === "daily"
                ? "bg-green-500 text-white border-green-500"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => switchTo("hourly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer ${
              rentingType === "hourly"
                ? "bg-green-500 text-white border-green-500"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Hourly
          </button>
        </div>

        {rentingType === "daily" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="block">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                From
              </span>
              <CustomDatePicker
                className="mt-1"
                value={dateFrom}
                onChange={(v) => {
                  setDateFrom(v);
                  onSelectionChange({
                    type: "rental",
                    renting_type: "daily",
                    date_from: v,
                    date_to: dateTo,
                  });
                }}
                max={dateTo || undefined}
              />
            </div>
            <div className="block">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                To
              </span>
              <CustomDatePicker
                className="mt-1"
                value={dateTo}
                onChange={(v) => {
                  setDateTo(v);
                  onSelectionChange({
                    type: "rental",
                    renting_type: "daily",
                    date_from: dateFrom,
                    date_to: v,
                  });
                }}
                min={dateFrom || undefined}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="block">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Select Date
              </span>
              <CustomDatePicker
                className="mt-1"
                value={selectedDate}
                onChange={(v) => {
                  setSelectedDate(v);
                  onSelectionChange({
                    type: "rental",
                    renting_type: "hourly",
                    date: v,
                    slot: "",
                  });
                }}
              />
            </div>

            <div className="block">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Available Slots
                <svg
                  className={`h-3.5 w-3.5 shrink-0 animate-spin text-green-500 transition-opacity ${
                    rentalLoading ? "opacity-100" : "opacity-0"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden={!rentalLoading}
                  aria-label="Loading slots"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </span>
              <RentalHourlySlots
                className="mt-1"
                date={selectedDate}
                loading={rentalLoading}
                slotData={rentalSlotData?.bookingSlots || []}
                selectedSlot={hourlySelectedSlot}
                onSelectSlot={(slot) => {
                  onSelectionChange({
                    type: "rental",
                    renting_type: "hourly",
                    date: selectedDate,
                    slot,
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DatePlusSlotPicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        slotData={slotData?.bookingSlots || []}
        loading={slotLoading}
        selectedSlot={
          selection && "type" in selection && "slot" in selection
            ? (selection as any).slot
            : ""
        }
        onSelectSlot={(slot) => {
          onSelectionChange({
            type: sub as "appointment" | "table" | "default",
            date: selectedDate,
            slot,
          });
        }}
        slotLabel="from-to"
      />

      {sub === "table" && (
        <div>
          <label className="block">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Special Request / Notes
            </span>
            <textarea
              value={bookingNote}
              onChange={(e) => onBookingNoteChange(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
              placeholder="Any special requests?"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function RentalHourlySlots({
  date,
  loading,
  slotData,
  selectedSlot,
  onSelectSlot,
  className = "",
}: {
  date: string;
  loading: boolean;
  slotData: SlotResult[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  className?: string;
}) {
  const options: DropdownOption[] = (() => {
    if (!slotData?.length) return [];
    const out: DropdownOption[] = [];
    slotData.forEach((s) => {
      (s.slots || []).forEach((slot: any) => {
        let value: string;
        let label: string;
        if (typeof slot === "string") {
          value = slot;
          label = slot;
        } else if (slot?.from && slot?.to) {
          value = `${slot.from} - ${slot.to}`;
          label = `${slot.from} - ${slot.to}`;
        } else if (slot?.timestamp) {
          value = String(slot.timestamp);
          label = String(slot.timestamp);
        } else {
          value = String(slot);
          label = String(slot);
        }
        out.push({ value, label, groupLabel: s.time });
      });
    });
    return out;
  })();

  const placeholder = !date
    ? "Select a date first"
    : loading
    ? "Loading slots..."
    : !options.length
    ? "No slots for this date"
    : "Select a slot";

  return (
    <CustomDropdown
      className={className}
      value={selectedSlot}
      onChange={onSelectSlot}
      options={options}
      placeholder={placeholder}
      disabled={!date || !options.length}
      loading={loading}
      loadingMessage="Loading slots..."
      emptyMessage="No time slots are available for the selected date."
      ariaLabel="Available slots"
    />
  );
}

function DatePlusSlotPicker({
  selectedDate,
  setSelectedDate,
  slotData,
  loading,
  selectedSlot,
  onSelectSlot,
  slotLabel,
}: {
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  slotData: SlotResult[] | undefined;
  loading: boolean;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  slotLabel: "from-to" | "time";
}) {
  const flatOptions: { value: string; label: string }[] = (() => {
    if (!slotData?.length) return [];
    if (slotLabel === "from-to") {
      return slotData.map((s, i) => ({
        value: getSlotKey(s, i),
        label: `${s.from}-${s.to}`,
      }));
    }
    const out: { value: string; label: string }[] = [];
    slotData.forEach((s, i) => {
      const groupKey = getSlotKey(s, i);
      (s.slots || []).forEach((slot: any, j: number) => {
        const value = slot.timestamp
          ? String(slot.timestamp)
          : `${groupKey}:${slot.from || slot}-${j}`;
        const label = slot.from ? `${slot.from}-${slot.to}` : String(slot);
        out.push({ value, label: s.time ? `${s.time} · ${label}` : label });
      });
    });
    return out;
  })();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="block">
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          Select Date
        </span>
        <CustomDatePicker
          className="mt-1"
          value={selectedDate}
          onChange={(v) => setSelectedDate(v)}
        />
      </div>

      <div className="block">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
          Available Slots
          <svg
            className={`h-3.5 w-3.5 shrink-0 animate-spin text-green-500 transition-opacity ${
              loading ? "opacity-100" : "opacity-0"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden={!loading}
            aria-label="Loading slots"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
        <CustomDropdown
          className="mt-1"
          value={selectedSlot}
          onChange={onSelectSlot}
          options={flatOptions}
          placeholder={
            !selectedDate
              ? "Select a date first"
              : !flatOptions.length
              ? "No slots available"
              : "Select a slot"
          }
          disabled={!selectedDate || !flatOptions.length}
          loading={loading}
          loadingMessage="Loading slots..."
          emptyMessage="No slots available for this date."
          ariaLabel="Available slots"
        />
      </div>
    </div>
  );
}
