import { useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { CreateProductReviewInput } from "@/types/review";
import { CREATE_PRODUCT_REVIEW } from "@/graphql/catalog/mutations/ProductReview";
import { GET_CUSTOMER_REVIEWS } from "@/graphql/customer/queries/GetCustomerReviews";

export function useProductReview() {
    const { showToast } = useCustomToast();

    const [createReviewMutation, { loading: isLoading }] = useMutation(CREATE_PRODUCT_REVIEW, {
        onCompleted: () => {
            showToast("Product review created successfully", "success");
        },
        onError: (error: any) => {
            showToast(error?.message || "Failed to create review", "danger");
        },
        refetchQueries: [{ query: GET_CUSTOMER_REVIEWS, variables: { first: 10 } }]
    });

    const createProductReview = async (input: CreateProductReviewInput) => {
        return await createReviewMutation({
            variables: {
                input: {
                    productId: input.productId,
                    title: input.title,
                    comment: input.comment,
                    rating: input.rating,
                    name: input.name,
                    email: input.email,
                    attachments: input.attachments || "",
                }
            }
        });
    };

    return {
        createProductReview,
        isLoading,
    };
}
