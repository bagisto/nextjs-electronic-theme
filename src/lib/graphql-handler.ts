import { NextRequest, NextResponse } from "next/server";
import { bagistoFetch } from "@/utils/bagisto-client";
import { isBagistoError } from "@/utils/type-guards";
import { getAuthToken } from "@/utils/helper";

import {
  // Cart operations
  CREATE_ADD_PRODUCT_IN_CART,
  REMOVE_CART_ITEM,
  UPDATE_CART_ITEM,
  GET_CART_ITEM,
  CREATE_CART_TOKEN,
  CREATE_MERGE_CART,
} from "@/graphql/cart/mutations";

import {
  // Checkout queries
  GET_CHECKOUT_ADDRESSES,
  GET_CHECKOUT_PAYMENT_METHODS,
  GET_CHECKOUT_SHIPPING_RATES,
} from "@/graphql/checkout/queries";

import {
  // Checkout mutations
  CREATE_CHECKOUT_ORDER,
  CREATE_CHECKOUT_ADDRESS,
  CREATE_CHECKOUT_PAYMENT_METHODS,
  CREATE_CHECKOUT_SHIPPING_METHODS,
} from "@/graphql/checkout/mutations";

import {
  // Customer queries - individual exports
  GET_CUSTOMER_PROFILE,
  GET_CUSTOMER_REVIEWS,
  GET_CUSTOMER_ORDERS,
} from "@/graphql/customer/queries";

import { GET_CUSTOMER_ADDRESSES } from "@/graphql/customer/queries/GetCustomerAddresses";

import { GET_CUSTOMER_ORDER_ID_INVOICES } from "@/graphql/customer/queries/GetCustomerOrderInvoices";

import { GET_CUSTOMER_ORDER_ID } from "@/graphql/customer/queries/getCustomerSpecificOrder";

import {
  // Customer mutations
  CUSTOMER_LOGIN,
  CUSTOMER_LOGOUT,
  CUSTOMER_REGISTRATION,
  FORGET_PASSWORD,
  VERIFY_CUSTOMER,
  UPDATE_CUSTOMER_PROFILE,
} from "@/graphql/customer/mutations";

import { DELETE_CUSTOMER_ADDRESS } from "@/graphql/customer/mutations/DeleteCustomerAddress";

import { CREATE_CUSTOMER_ADDRESS } from "@/graphql/customer/mutations/CreateCustomerAddress";

// Wishlist operations
import {
  TOGGLE_WISHLIST,
  CREATE_WISHLIST,
  DELETE_WISHLIST,
  MOVE_WISHLIST_TO_CART,
} from "@/graphql/wishlist/mutations";

import { GET_ALL_WISHLIST } from "@/graphql/wishlist/query/GetAllWishList";

// Compare operations
import { GET_COMPARE_ITEMS } from "@/graphql/catalog/queries/CompareItems";

import {
  CREATE_COMPARE_ITEM,
  DELETE_COMPARE_ITEM,
} from "@/graphql/catalog/mutations/CompareItems";

// Review operations
import { CREATE_PRODUCT_REVIEW } from "@/graphql/catalog/mutations/ProductReview";

// Theme operations
import { SUBSCRIBE_TO_NEWSLETTER } from "@/graphql/theme/mutations/subscribeToNewsletter";

// Booking operations
import {
  GET_BOOKING_SLOTS,
  GET_RENTAL_BOOKING_SLOTS,
} from "@/graphql/catalog/queries/BookingSpecificQueries";

// Operation type definitions
type OperationType = "query" | "mutation";

interface OperationDefinition {
  name: string;
  query: any;
  operationType: OperationType;
  variableSchema?: Record<string, any>;
}

// Allowed operations map - defines all valid operations
// Include aliases for common operation name variations based on GraphQL definition names
const ALLOWED_OPERATIONS: Record<string, OperationDefinition> = {
  // Cart Operations - with GraphQL definition aliases
  CreateCart: {
    name: "CreateCart",
    query: CREATE_CART_TOKEN,
    operationType: "mutation",
  },
  CreateCartToken: {
    name: "CreateCartToken",
    query: CREATE_CART_TOKEN,
    operationType: "mutation",
  },
  CreateAddProductInCart: {
    name: "CreateAddProductInCart",
    query: CREATE_ADD_PRODUCT_IN_CART,
    operationType: "mutation",
    variableSchema: {
      cartId: { type: "string", required: false },
      productId: { type: "string", required: true },
      quantity: { type: "number", required: true },
    },
  },
  AddToCart: {
    name: "AddToCart",
    query: CREATE_ADD_PRODUCT_IN_CART,
    operationType: "mutation",
    variableSchema: {
      cartId: { type: "string", required: false },
      productId: { type: "string", required: true },
      quantity: { type: "number", required: true },
    },
  },
  RemoveCartItem: {
    name: "RemoveCartItem",
    query: REMOVE_CART_ITEM,
    operationType: "mutation",
    variableSchema: {
      cartItemId: { type: "number", required: true },
    },
  },
  CreateRemoveCartItem: {
    name: "CreateRemoveCartItem",
    query: REMOVE_CART_ITEM,
    operationType: "mutation",
    variableSchema: {
      cartItemId: { type: "number", required: true },
    },
  },
  UpdateCartItem: {
    name: "UpdateCartItem",
    query: UPDATE_CART_ITEM,
    operationType: "mutation",
    variableSchema: {
      cartItemId: { type: "number", required: true },
      quantity: { type: "number", required: true },
      groupedQty: { type: "string", required: false },
      bundleOptions: { type: "string", required: false },
      bundleOptionQty: { type: "string", required: false },
      links: { type: "object", required: false },
      booking: { type: "string", required: false },
      bookingNote: { type: "string", required: false },
    },
  },
  CreateUpdateCartItem: {
    name: "CreateUpdateCartItem",
    query: UPDATE_CART_ITEM,
    operationType: "mutation",
    variableSchema: {
      cartItemId: { type: "number", required: true },
      quantity: { type: "number", required: true },
      groupedQty: { type: "string", required: false },
      bundleOptions: { type: "string", required: false },
      bundleOptionQty: { type: "string", required: false },
      links: { type: "object", required: false },
      booking: { type: "string", required: false },
      bookingNote: { type: "string", required: false },
    },
  },
  GetCartItem: {
    name: "GetCartItem",
    query: GET_CART_ITEM,
    operationType: "mutation",
  },
  ReadCart: {
    name: "ReadCart",
    query: GET_CART_ITEM,
    operationType: "mutation",
  },
  createMergeCart: {
    name: "createMergeCart",
    query: CREATE_MERGE_CART,
    operationType: "mutation",
    variableSchema: {
      cartId: { type: "string", required: false },
    },
  },
  MergeCart: {
    name: "MergeCart",
    query: CREATE_MERGE_CART,
    operationType: "mutation",
    variableSchema: {
      cartId: { type: "string", required: false },
    },
  },

  // Checkout Operations - with GraphQL definition aliases
  GetCheckoutAddresses: {
    name: "GetCheckoutAddresses",
    query: GET_CHECKOUT_ADDRESSES,
    operationType: "query",
  },
  collectionGetCheckoutAddresses: {
    name: "collectionGetCheckoutAddresses",
    query: GET_CHECKOUT_ADDRESSES,
    operationType: "query",
  },
  createCheckoutAddress: {
    name: "createCheckoutAddress",
    query: CREATE_CHECKOUT_ADDRESS,
    operationType: "mutation",
  },
  SaveCheckoutAddress: {
    name: "SaveCheckoutAddress",
    query: CREATE_CHECKOUT_ADDRESS,
    operationType: "mutation",
  },
  GetShippingMethods: {
    name: "GetShippingMethods",
    query: GET_CHECKOUT_SHIPPING_RATES,
    operationType: "query",
  },
  CheckoutShippingRates: {
    name: "CheckoutShippingRates",
    query: GET_CHECKOUT_SHIPPING_RATES,
    operationType: "query",
  },
  CreateCheckoutShippingMethod: {
    name: "CreateCheckoutShippingMethod",
    query: CREATE_CHECKOUT_SHIPPING_METHODS,
    operationType: "mutation",
    variableSchema: {
      shippingMethod: { type: "string", required: true },
    },
  },
  SaveShippingMethod: {
    name: "SaveShippingMethod",
    query: CREATE_CHECKOUT_SHIPPING_METHODS,
    operationType: "mutation",
    variableSchema: {
      shippingMethod: { type: "string", required: true },
    },
  },
  GetPaymentMethods: {
    name: "GetPaymentMethods",
    query: GET_CHECKOUT_PAYMENT_METHODS,
    operationType: "query",
  },
  CheckoutPaymentMethods: {
    name: "CheckoutPaymentMethods",
    query: GET_CHECKOUT_PAYMENT_METHODS,
    operationType: "query",
  },
  CreateCheckoutPaymentMethod: {
    name: "CreateCheckoutPaymentMethod",
    query: CREATE_CHECKOUT_PAYMENT_METHODS,
    operationType: "mutation",
    variableSchema: {
      paymentMethod: { type: "string", required: true },
    },
  },
  SavePaymentMethod: {
    name: "SavePaymentMethod",
    query: CREATE_CHECKOUT_PAYMENT_METHODS,
    operationType: "mutation",
    variableSchema: {
      paymentMethod: { type: "string", required: true },
    },
  },
  PlaceOrder: {
    name: "PlaceOrder",
    query: CREATE_CHECKOUT_ORDER,
    operationType: "mutation",
  },
  CreateCheckoutOrder: {
    name: "CreateCheckoutOrder",
    query: CREATE_CHECKOUT_ORDER,
    operationType: "mutation",
  },

  // Customer Operations
  getCustomerProfile: {
    name: "getCustomerProfile",
    query: GET_CUSTOMER_PROFILE,
    operationType: "query",
  },
  GetCustomerProfile: {
    name: "GetCustomerProfile",
    query: GET_CUSTOMER_PROFILE,
    operationType: "query",
  },
  updateCustomerProfile: {
    name: "updateCustomerProfile",
    query: UPDATE_CUSTOMER_PROFILE,
    operationType: "mutation",
    variableSchema: {
      input: { type: "object", required: true },
    },
  },
  UpdateCustomerProfile: {
    name: "UpdateCustomerProfile",
    query: UPDATE_CUSTOMER_PROFILE,
    operationType: "mutation",
    variableSchema: {
      input: { type: "object", required: true },
    },
  },
  GetCustomerAddresses: {
    name: "GetCustomerAddresses",
    query: GET_CUSTOMER_ADDRESSES,
    operationType: "query",
    variableSchema: {
      first: { type: "number", required: false },
    },
  },
  CreateCustomerAddress: {
    name: "CreateCustomerAddress",
    query: CREATE_CUSTOMER_ADDRESS,
    operationType: "mutation",
  },
  DeleteCustomerAddress: {
    name: "DeleteCustomerAddress",
    query: DELETE_CUSTOMER_ADDRESS,
    operationType: "mutation",
  },
  GetCustomerOrders: {
    name: "GetCustomerOrders",
    query: GET_CUSTOMER_ORDERS,
    operationType: "query",
    variableSchema: {
      first: { type: "number", required: false },
    },
  },
  GetCustomerOrderDetail: {
    name: "GetCustomerOrderDetail",
    query: GET_CUSTOMER_ORDER_ID,
    operationType: "query",
    variableSchema: {
      id: { type: "string", required: true },
    },
  },
  CustomerOrder: {
    name: "CustomerOrder",
    query: GET_CUSTOMER_ORDER_ID,
    operationType: "query",
    variableSchema: {
      id: { type: "string", required: true },
    },
  },
  GetCustomerOrderInvoices: {
    name: "GetCustomerOrderInvoices",
    query: GET_CUSTOMER_ORDER_ID_INVOICES,
    operationType: "query",
    variableSchema: {
      orderId: { type: "number", required: true },
    },
  },
  CustomerInvoices: {
    name: "CustomerInvoices",
    query: GET_CUSTOMER_ORDER_ID_INVOICES,
    operationType: "query",
    variableSchema: {
      orderId: { type: "number", required: true },
    },
  },
  GetCustomerReviews: {
    name: "GetCustomerReviews",
    query: GET_CUSTOMER_REVIEWS,
    operationType: "query",
    variableSchema: {
      first: { type: "number", required: false },
    },
  },
  CustomerReviews: {
    name: "CustomerReviews",
    query: GET_CUSTOMER_REVIEWS,
    operationType: "query",
    variableSchema: {
      first: { type: "number", required: false },
    },
  },
  CustomerLogin: {
    name: "CustomerLogin",
    query: CUSTOMER_LOGIN,
    operationType: "mutation",
  },
  CustomerLogout: {
    name: "CustomerLogout",
    query: CUSTOMER_LOGOUT,
    operationType: "mutation",
  },
  CustomerRegistration: {
    name: "CustomerRegistration",
    query: CUSTOMER_REGISTRATION,
    operationType: "mutation",
  },
  ForgetPassword: {
    name: "ForgetPassword",
    query: FORGET_PASSWORD,
    operationType: "mutation",
  },
  VerifyCustomer: {
    name: "VerifyCustomer",
    query: VERIFY_CUSTOMER,
    operationType: "mutation",
  },

  // Wishlist Operations - with aliases
  GetWishlist: {
    name: "GetWishlist",
    query: GET_ALL_WISHLIST,
    operationType: "query",
  },
  GetAllWishlists: {
    name: "GetAllWishlists",
    query: GET_ALL_WISHLIST,
    operationType: "query",
  },
  ToggleWishlist: {
    name: "ToggleWishlist",
    query: TOGGLE_WISHLIST,
    operationType: "mutation",
    variableSchema: {
      input: { type: "object", required: true },
    },
  },
  CreateWishlist: {
    name: "CreateWishlist",
    query: CREATE_WISHLIST,
    operationType: "mutation",
  },
  DeleteWishlist: {
    name: "DeleteWishlist",
    query: DELETE_WISHLIST,
    operationType: "mutation",
  },
  MoveWishlistToCart: {
    name: "MoveWishlistToCart",
    query: MOVE_WISHLIST_TO_CART,
    operationType: "mutation",
  },
  MoveToCart: {
    name: "MoveToCart",
    query: MOVE_WISHLIST_TO_CART,
    operationType: "mutation",
  },

  // Compare Operations - with aliases
  GetCompareItems: {
    name: "GetCompareItems",
    query: GET_COMPARE_ITEMS,
    operationType: "query",
    variableSchema: {
      first: { type: "number", required: false },
    },
  },
  CompareItems: {
    name: "CompareItems",
    query: GET_COMPARE_ITEMS,
    operationType: "query",
    variableSchema: {
      first: { type: "number", required: false },
    },
  },
  CreateCompareItem: {
    name: "CreateCompareItem",
    query: CREATE_COMPARE_ITEM,
    operationType: "mutation",
    variableSchema: {
      productId: { type: "number", required: true },
    },
  },
  DeleteCompareItem: {
    name: "DeleteCompareItem",
    query: DELETE_COMPARE_ITEM,
    operationType: "mutation",
    variableSchema: {
      id: { type: "string", required: true },
    },
  },

  // Review Operations
  CreateProductReview: {
    name: "CreateProductReview",
    query: CREATE_PRODUCT_REVIEW,
    operationType: "mutation",
  },

  // Theme Operations
  SubscribeToNewsletter: {
    name: "SubscribeToNewsletter",
    query: SUBSCRIBE_TO_NEWSLETTER,
    operationType: "mutation",
  },

  // Booking Operations
  GetBookingSlots: {
    name: "GetBookingSlots",
    query: GET_BOOKING_SLOTS,
    operationType: "query",
    variableSchema: {
      id: { type: "number", required: true },
      date: { type: "string", required: true },
    },
  },
  GetRentalBookingSlots: {
    name: "GetRentalBookingSlots",
    query: GET_RENTAL_BOOKING_SLOTS,
    operationType: "query",
    variableSchema: {
      id: { type: "number", required: true },
      date: { type: "string", required: true },
    },
  },
};

/**
 * Validate variables against the schema
 */
function validateVariables(
  variables: Record<string, any>,
  schema: Record<string, { type: string; required: boolean }> | undefined,
): { valid: boolean; errors: string[] } {
  if (!schema) return { valid: true, errors: [] };

  const errors: string[] = [];

  // Check required fields
  for (const [key, config] of Object.entries(schema)) {
    if (
      config.required &&
      (variables[key] === undefined || variables[key] === null)
    ) {
      errors.push(`Missing required field: ${key}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Execute a GraphQL operation through the centralized handler
 */
export async function executeGraphQLOperation(
  operationName: string,
  variables: Record<string, any> = {},
  req?: NextRequest,
): Promise<NextResponse> {
  // Check if operation is allowed
  const operation = ALLOWED_OPERATIONS[operationName];

  if (!operation) {
    console.error(`[GraphQL] Operation not allowed: ${operationName}`);
    return NextResponse.json(
      {
        errors: [
          {
            message: `Operation '${operationName}' is not allowed. Valid operations: ${Object.keys(ALLOWED_OPERATIONS).join(", ")}`,
          },
        ],
      },
      { status: 400 },
    );
  }

  // Validate variables
  const validation = validateVariables(variables, operation.variableSchema);
  if (!validation.valid) {
    console.error(
      `[GraphQL] Variable validation failed for ${operationName}:`,
      validation.errors,
    );
    return NextResponse.json(
      { errors: [{ message: validation.errors.join(", ") }] },
      { status: 400 },
    );
  }

  // Get auth token from request
  const guestToken = req ? getAuthToken(req) : undefined;

  try {
    const response = await bagistoFetch({
      query: operation.query,
      variables: variables as any,
      cache: "no-store",
      guestToken,
    });

    return NextResponse.json(response.body);
  } catch (error) {

    if (isBagistoError(error)) {
      return NextResponse.json(
        {
          data: { [operationName]: null },
          error: error.cause ?? error,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET handler - returns list of allowed operations
 */
export async function GET() {
  return NextResponse.json({
    message: "Centralized GraphQL API",
    allowedOperations: Object.keys(ALLOWED_OPERATIONS),
    usage: {
      method: "POST",
      body: {
        operationName: "AddToCart",
        variables: {
          productId: "1",
          quantity: 1,
        },
      },
    },
  });
}

/**
 * POST handler - executes the GraphQL operation
 * Supports both Apollo Client format (query + variables) and custom format (operationName + variables)
 */
export async function POST(req: NextRequest) {
  try {
    // Check content type
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { errors: [{ message: "Content-Type must be application/json" }] },
        { status: 400 },
      );
    }

    // Try to parse the body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { errors: [{ message: "Invalid JSON body" }] },
        { status: 400 },
      );
    }

    // Support both Apollo Client format and custom operationName format
    let operationName: string | undefined;
    let variables: Record<string, any> = {};

    if (body.query) {
      // Apollo Client format: { query: "mutation UpdateCartItem(...)", variables: {...}, operationName: "UpdateCartItem" }
      operationName = body.operationName;
      variables = body.variables || {};

      // If operationName is not provided, try to extract it from the query string
      if (!operationName && typeof body.query === "string") {
        const match = body.query.match(/(?:mutation|query)\s+(\w+)/);
        if (match) {
          operationName = match[1];
        }
      }
    } else if (body.operationName) {
      // Custom format: { operationName: "UpdateCartItem", variables: {...} }
      operationName = body.operationName;
      variables = body.variables || {};
    }

    if (!operationName) {
      return NextResponse.json(
        {
          errors: [
            {
              message:
                "operationName is required or could not be extracted from query",
            },
          ],
        },
        { status: 400 },
      );
    }

    return executeGraphQLOperation(operationName, variables, req);
  } catch (error) {
    console.error("GraphQL API Error:", error);
    return NextResponse.json(
      {
        errors: [
          {
            message:
              error instanceof Error ? error.message : "Internal Server Error",
          },
        ],
      },
      { status: 500 },
    );
  }
}
