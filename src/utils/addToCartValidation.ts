export type AddToCartReason =
  | "INVALID_QTY"
  | "QTY_EXCEEDS_LIMIT"
  | "OUT_OF_STOCK"
  | "NO_VARIANT"
  | "VARIANT_OOS"
  | "NO_GROUPED_QTY"
  | "GROUPED_QTY_HIGH"
  | "BUNDLE_REQ_MISSING"
  | "BUNDLE_QTY_LOW"
  | "BUNDLE_MAX"
  | "BUNDLE_EMPTY"
  | "NO_LINK"
  | "NO_DATE"
  | "NO_SLOTS_FOR_DATE"
  | "NO_SLOT"
  | "SLOT_FULL"
  | "BOOKING_EXPIRED"
  | "PAST_DATE"
  | "MISSING_NOTE"
  | "NO_TICKET"
  | "TICKET_QTY_HIGH"
  | "EVENT_EXPIRED"
  | "EVENT_NOT_STARTED"
  | "NO_DATE_FROM"
  | "NO_DATE_TO"
  | "INVALID_DATE_RANGE"
  | "DAY_UNAVAILABLE"
  | "NO_RENTING_TYPE"
  | "SLOTS_LOADING"
  | "CART_INIT_FAILED";

export type ToastColor = "warning" | "danger" | "success" | "primary";

export type ValidationContext = {
  max?: number;
  optionLabel?: string;
  productName?: string;
  ticketName?: string;
  date?: string;
};

export type ValidationResult = {
  ok: boolean;
  reason?: AddToCartReason;
  message?: string;
  toastColor?: ToastColor;
  context?: ValidationContext;
};

const TYPES_REQUIRING_OPTIONS: ReadonlySet<string> = new Set([
  "configurable",
  "grouped",
  "bundle",
  "downloadable",
  "booking",
]);

export function productRequiresOptions(type?: string | null): boolean {
  return !!type && TYPES_REQUIRING_OPTIONS.has(type);
}

const HARD_FAILURES: ReadonlySet<AddToCartReason> = new Set([
  "OUT_OF_STOCK",
  "VARIANT_OOS",
  "BOOKING_EXPIRED",
  "EVENT_EXPIRED",
  "CART_INIT_FAILED",
  "SLOT_FULL",
  "DAY_UNAVAILABLE",
]);

export function colorFor(reason: AddToCartReason): ToastColor {
  return HARD_FAILURES.has(reason) ? "danger" : "warning";
}

export function messageFor(
  reason: AddToCartReason,
  ctx: ValidationContext = {}
): string {
  switch (reason) {
    case "INVALID_QTY":
      return "Please enter a quantity of at least 1.";
    case "QTY_EXCEEDS_LIMIT":
      return ctx.max
        ? `Only ${ctx.max} units available for this product.`
        : "Quantity exceeds available stock.";
    case "OUT_OF_STOCK":
      return "This product is out of stock.";
    case "NO_VARIANT":
      return "Please select all options before adding to cart.";
    case "VARIANT_OOS":
      return "Selected combination is out of stock. Please choose another.";
    case "NO_GROUPED_QTY":
      return "Please set a quantity for at least one product.";
    case "GROUPED_QTY_HIGH":
      return ctx.productName && ctx.max
        ? `Quantity for ${ctx.productName} exceeds available stock (${ctx.max}).`
        : "Quantity exceeds available stock.";
    case "BUNDLE_REQ_MISSING":
      return ctx.optionLabel
        ? `Please make a selection for: ${ctx.optionLabel}.`
        : "Please complete all required bundle options.";
    case "BUNDLE_QTY_LOW":
      return ctx.productName
        ? `Please enter a quantity of at least 1 for ${ctx.productName}.`
        : "Please enter a quantity of at least 1.";
    case "BUNDLE_MAX":
      return ctx.optionLabel && ctx.max
        ? `You can select at most ${ctx.max} items under ${ctx.optionLabel}.`
        : "You have selected too many items.";
    case "BUNDLE_EMPTY":
      return "Please configure your bundle to continue.";
    case "NO_LINK":
      return "Please select at least one download to add to cart.";
    case "NO_DATE":
      return "Please select a date.";
    case "NO_SLOTS_FOR_DATE":
      return "No slots are available for the selected date. Please choose another date.";
    case "NO_SLOT":
      return "Please select a slot. If no slots are available, choose another date.";
    case "SLOT_FULL":
      return "This slot is no longer available. Please pick a different slot.";
    case "BOOKING_EXPIRED":
      return "This booking is no longer available.";
    case "PAST_DATE":
      return "Please select a future date.";
    case "MISSING_NOTE":
      return "Please add a note for your reservation.";
    case "NO_TICKET":
      return "Please select at least one ticket.";
    case "TICKET_QTY_HIGH":
      return ctx.ticketName && ctx.max
        ? `Only ${ctx.max} tickets available for ${ctx.ticketName}.`
        : "Ticket quantity exceeds available stock.";
    case "EVENT_EXPIRED":
      return "This event has ended.";
    case "EVENT_NOT_STARTED":
      return ctx.date
        ? `Ticket sales open on ${ctx.date}.`
        : "Ticket sales have not started yet.";
    case "NO_DATE_FROM":
      return "Please select a start date.";
    case "NO_DATE_TO":
      return "Please select an end date.";
    case "INVALID_DATE_RANGE":
      return "End date must be after the start date.";
    case "DAY_UNAVAILABLE":
      return "One or more days in the selected range are unavailable. Please adjust your dates.";
    case "NO_RENTING_TYPE":
      return "Please choose daily or hourly rental.";
    case "SLOTS_LOADING":
      return "Loading available slots, please try again in a moment.";
    case "CART_INIT_FAILED":
      return "We couldn't start your cart. Please refresh and try again.";
    default:
      return "Please complete your selection.";
  }
}

function fail(
  reason: AddToCartReason,
  context: ValidationContext = {}
): ValidationResult {
  return {
    ok: false,
    reason,
    message: messageFor(reason, context),
    toastColor: colorFor(reason),
    context,
  };
}

const ok: ValidationResult = { ok: true };

const extractId = (id: string | number): string => {
  const parts = String(id).split("/");
  return parts[parts.length - 1] || String(id);
};

const isFalsyFlag = (v: unknown): boolean =>
  v === false || v === 0 || v === "" || v === "0" || v == null;

const isPastDate = (iso?: string): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
};

export type ValidateInput = {
  type: string | undefined;
  isSaleable: unknown;
  quantity: number;
  maxQuantity?: number;

  isConfigurable?: boolean;
  selectedVariantId?: string | number | null;
  variantInStock?: boolean;

  selectedLinks?: number[];

  groupedProducts?: { edges: { node: any }[] } | null;
  groupedQuantities?: Record<string, number>;

  bundleOptions?: { edges: { node: any }[] } | null;
  bundleSelections?: Record<string, string[]>;
  bundleQuantities?: Record<string, number>;
  bundleTotal?: number;
  basePrice?: number;

  bookingInfo?: any;
  bookingSelection?: any;
  bookingNote?: string;
  ticketQtys?: Record<string, number>;
  ticketLimits?: Record<string, number>;
  slotsLoading?: boolean;
  noSlotsForDate?: boolean;
  selectedSlotQty?: number | null;
  requireBookingNote?: boolean;
};

export function validateAddToCart(input: ValidateInput): ValidationResult {
  const {
    type,
    isSaleable,
    quantity,
    maxQuantity,
    isConfigurable,
    selectedVariantId,
    variantInStock,
    selectedLinks = [],
    groupedProducts,
    groupedQuantities = {},
    bundleOptions,
    bundleSelections = {},
    bundleQuantities = {},
    bundleTotal,
    basePrice,
    bookingInfo,
    bookingSelection,
    bookingNote,
    ticketQtys = {},
    ticketLimits = {},
    slotsLoading,
    noSlotsForDate,
    selectedSlotQty,
    requireBookingNote,
  } = input;

  if (isFalsyFlag(isSaleable) && type !== "booking") {
    return fail("OUT_OF_STOCK");
  }

  if (type === "configurable") {
    if (isConfigurable && !selectedVariantId) return fail("NO_VARIANT");
    if (variantInStock === false) return fail("VARIANT_OOS");
  }

  if (type === "simple" || type === "virtual" || type === "configurable") {
    if (!quantity || quantity < 1) return fail("INVALID_QTY");
    if (maxQuantity != null && quantity > maxQuantity) {
      return fail("QTY_EXCEEDS_LIMIT", { max: maxQuantity });
    }
  }

  if (type === "downloadable") {
    if (!selectedLinks.length) return fail("NO_LINK");
  }

  if (type === "grouped") {
    const edges = groupedProducts?.edges || [];
    const activeQuantities: Array<{ id: string; qty: number; max?: number; name?: string }> =
      [];
    for (const edge of edges) {
      const assoc = edge.node?.associatedProduct;
      if (!assoc) continue;
      const explicitlyOOS =
        assoc.isSaleable === false ||
        assoc.isSaleable === 0 ||
        assoc.isSaleable === "" ||
        assoc.isSaleable === "0";
      if (explicitlyOOS) continue;
      const pid = extractId(assoc.id);
      const qty = groupedQuantities[pid] ?? 0;
      if (qty > 0) {
        activeQuantities.push({
          id: pid,
          qty,
          max: typeof assoc.maxQty === "number" ? assoc.maxQty : undefined,
          name: assoc.name,
        });
      }
    }
    if (!activeQuantities.length) return fail("NO_GROUPED_QTY");
    for (const row of activeQuantities) {
      if (row.max != null && row.qty > row.max) {
        return fail("GROUPED_QTY_HIGH", { productName: row.name, max: row.max });
      }
    }
  }

  if (type === "bundle") {
    const optionEdges = bundleOptions?.edges || [];
    for (const optEdge of optionEdges) {
      const opt = optEdge.node;
      const optId = extractId(opt.id);
      const selected = bundleSelections[optId] || [];
      if (opt.isRequired && selected.length === 0) {
        return fail("BUNDLE_REQ_MISSING", {
          optionLabel: opt.translation?.label || `Option ${optId}`,
        });
      }
      if (typeof opt.max === "number" && selected.length > opt.max) {
        return fail("BUNDLE_MAX", {
          optionLabel: opt.translation?.label || `Option ${optId}`,
          max: opt.max,
        });
      }
      for (const pEdge of opt.bundleOptionProducts?.edges || []) {
        const pid = extractId(pEdge.node.id);
        if (!selected.includes(pid)) continue;
        if (pEdge.node.isUserDefined) {
          const q = bundleQuantities[pid] ?? pEdge.node.qty ?? 1;
          if (q < 1) {
            return fail("BUNDLE_QTY_LOW", {
              productName: pEdge.node.product?.name,
            });
          }
        }
      }
    }
    const total = bundleTotal ?? 0;
    const anySelected = Object.values(bundleSelections).some(
      (ids) => ids && ids.length > 0
    );
    if (!anySelected && !(basePrice && basePrice > 0) && total === 0) {
      return fail("BUNDLE_EMPTY");
    }
  }

  if (type === "booking") {
    const sub: string | undefined = bookingInfo?.type;

    if (bookingInfo?.availableTo && isPastDate(bookingInfo.availableTo)) {
      return fail(sub === "event" ? "EVENT_EXPIRED" : "BOOKING_EXPIRED");
    }
    if (
      sub === "event" &&
      bookingInfo?.availableFrom &&
      new Date(bookingInfo.availableFrom).getTime() > Date.now()
    ) {
      return fail("EVENT_NOT_STARTED", {
        date: new Date(bookingInfo.availableFrom).toLocaleDateString(),
      });
    }

    if (slotsLoading && sub !== "event") return fail("SLOTS_LOADING");

    if (sub === "event") {
      const totals = Object.entries(ticketQtys).filter(
        ([, q]) => Number(q) > 0
      );
      if (!totals.length) return fail("NO_TICKET");
      for (const [tid, q] of totals) {
        const max = ticketLimits[tid];
        if (max != null && Number(q) > max) {
          return fail("TICKET_QTY_HIGH", { max, ticketName: tid });
        }
      }
      return ok;
    }

    if (sub === "rental") {
      const sel = bookingSelection;
      if (!sel) return fail("NO_RENTING_TYPE");
      if (sel.renting_type === "daily") {
        if (!sel.date_from) return fail("NO_DATE_FROM");
        if (!sel.date_to) return fail("NO_DATE_TO");
        if (new Date(sel.date_to).getTime() < new Date(sel.date_from).getTime())
          return fail("INVALID_DATE_RANGE");
        if (isPastDate(sel.date_from)) return fail("PAST_DATE");
        return ok;
      }
      if (!sel.date) return fail("NO_DATE");
      if (isPastDate(sel.date)) return fail("PAST_DATE");
      if (noSlotsForDate) return fail("NO_SLOTS_FOR_DATE");
      if (!sel.slot) return fail("NO_SLOT");
      if (selectedSlotQty === 0) return fail("SLOT_FULL");
      return ok;
    }

    if (sub === "appointment" || sub === "table" || sub === "default") {
      const sel = bookingSelection;
      if (!sel || !sel.date) return fail("NO_DATE");
      if (isPastDate(sel.date)) return fail("PAST_DATE");
      if (noSlotsForDate) return fail("NO_SLOTS_FOR_DATE");
      if (!sel.slot) return fail("NO_SLOT");
      if (selectedSlotQty === 0) return fail("SLOT_FULL");
      if (sub === "table" && requireBookingNote && !bookingNote?.trim()) {
        return fail("MISSING_NOTE");
      }
      return ok;
    }
  }

  return ok;
}
