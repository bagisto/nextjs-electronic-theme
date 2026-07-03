import { GET_CUSTOMER_REVIEWS, GET_CUSTOMER_REVIEWS_PAGINATION } from "@/graphql/customer/queries/GetCustomerReviews";
import { useAppSelector } from "@/store/hooks";
import { useCursorPagination } from "./useCursorPagination";
import { getImageUrl, baseUrl, NOT_IMAGE } from "@/utils/constants";

interface UseCustomerReviewsOptions {
    pageSize?: number;
    page?: number;
    after?: string | null;
    before?: string | null;
}

export const useCustomerReviews = (options: UseCustomerReviewsOptions = {}) => {
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;

    const { pageSize = 10, page = 0, after = null, before = null } = options;

    const { edges, pageInfo, totalCount, loading, error, refetch } = useCursorPagination({
        listQuery: GET_CUSTOMER_REVIEWS,
        cursorQuery: GET_CUSTOMER_REVIEWS_PAGINATION,
        connectionKey: "customerReviews",
        skip: !isLoggedIn,
        paginate: true,
        pageSize,
        page,
        after,
        before,
    });

    const reviews = edges.map(
        (edge: { node: any }) => ({
            id: edge.node.createdAt,
            productName: edge.node.product?.name || edge.node.name,
            productImage: getImageUrl(edge.node.product?.baseImageUrl, baseUrl, NOT_IMAGE) || NOT_IMAGE,
            productUrlKey: edge.node.product?.urlKey || "",
            rating: edge.node.rating,
            date: new Date(edge.node.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            title: edge.node.title,
            comment: edge.node.comment,
            verified: true,
            status: edge.node.status,
        })
    );

    return {
        reviews,
        totalCount,
        pageInfo,
        loading,
        error,
        refetch,
    };
};
