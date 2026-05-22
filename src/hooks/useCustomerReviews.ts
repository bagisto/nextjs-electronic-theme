import { useQuery } from "@apollo/client";
import { useAppSelector } from "@/store/hooks";
import { GET_CUSTOMER_REVIEWS } from "@/graphql/customer/queries/GetCustomerReviews";

export const useCustomerReviews = () => {
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;

    const { data: reviewsData, loading, error, refetch } = useQuery(GET_CUSTOMER_REVIEWS, {
        variables: { first: 10 },
        skip: !isLoggedIn,
    });

    const reviews = reviewsData?.customerReviews?.edges?.map(
        (edge: { node: any }) => ({
            id: edge.node.createdAt,
            productName: edge.node.product?.name || edge.node.name,
            productImage: edge.node.product?.baseImageUrl || "/images/product-placeholder.jpg",
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
    ) || [];

    return {
        reviews,
        totalCount: reviewsData?.customerReviews?.totalCount || 0,
        loading,
        error,
        refetch,
    };
};
