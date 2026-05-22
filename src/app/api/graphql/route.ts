/**
 * Centralized GraphQL API Route
 * 
 * This is the single entry point for all GraphQL operations.
 * All API calls should go through this route with an operationName parameter.
 * 
 * Usage:
 * POST /api/graphql
 * {
 *   "operationName": "AddToCart",
 *   "variables": {
 *     "productId": "1",
 *     "quantity": 1
 *   }
 * }
 * 
 * GET /api/graphql - Returns list of allowed operations
 */

export { GET, POST } from "@/lib/graphql-handler";
