import { useQuery } from "@apollo/client";
import type { DocumentNode, WatchQueryFetchPolicy } from "@apollo/client";

export interface CursorPaginationOptions {
    /** Main list query (must accept $first/$last/$after/$before and return pageInfo + totalCount). */
    listQuery: DocumentNode;
    /** Lightweight query returning `pageInfo.endCursor`, used to resolve arbitrary page jumps. */
    cursorQuery: DocumentNode;
    /** The connection field name in the response (e.g. "wishlists", "customerOrders"). */
    connectionKey: string;
    /** Skip both queries entirely (e.g. when the user is logged out). */
    skip?: boolean;
    /** Enable cursor pagination. When false the list query runs with no pagination args (full list). */
    paginate?: boolean;
    /** Items per page. */
    pageSize?: number;
    /** Zero-based current page index (from the URL `page` param). */
    page?: number;
    /** Forward cursor (the `cursor`/`endCursor` URL param). */
    after?: string | null;
    /** Backward cursor (the `before`/`startCursor` URL param). */
    before?: string | null;
    /** Optional fetch policy forwarded to the list query. */
    fetchPolicy?: WatchQueryFetchPolicy;
}

/**
 * Shared cursor-based pagination used by the wishlist, orders, reviews,
 * addresses and compare listings. For an arbitrary (non-adjacent) page jump
 * the URL carries no cursor, so we first resolve the end cursor of all
 * preceding items via `cursorQuery`, then fetch the target page — mirroring
 * the search page's two-step pagination pattern.
 */
export function useCursorPagination(options: CursorPaginationOptions) {
    const {
        listQuery,
        cursorQuery,
        connectionKey,
        skip = false,
        paginate = false,
        pageSize = 10,
        page = 0,
        after = null,
        before = null,
        fetchPolicy,
    } = options;

    const needsCursorLookup = paginate && page > 0 && !after && !before;

    const { data: prelimData, loading: prelimLoading } = useQuery(cursorQuery, {
        skip: skip || !needsCursorLookup,
        variables: { first: page * pageSize },
    });

    const resolvedAfter = needsCursorLookup
        ? (prelimData?.[connectionKey]?.pageInfo?.endCursor ?? null)
        : after;

    const variables = paginate
        ? before
            ? { last: pageSize, before }
            : { first: pageSize, after: resolvedAfter }
        : {};

    // Wait for the cursor lookup to resolve before fetching the target page,
    // otherwise we'd briefly request page 1 with a null cursor.
    const waitingForCursor = needsCursorLookup && resolvedAfter === null && prelimLoading;

    const queryResult = useQuery(listQuery, {
        skip: skip || waitingForCursor,
        variables,
        ...(fetchPolicy ? { fetchPolicy } : {}),
    });

    const connection = queryResult.data?.[connectionKey] ?? null;

    return {
        ...queryResult,
        loading: queryResult.loading || waitingForCursor,
        connection,
        edges: connection?.edges ?? [],
        pageInfo: connection?.pageInfo ?? null,
        totalCount: connection?.totalCount ?? 0,
    };
}
