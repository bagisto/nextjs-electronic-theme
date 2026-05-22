export interface CreateProductReviewInput {
    productId: number;
    title: string;
    comment: string;
    rating: number;
    name: string;
    email: string;
    attachments?: string;
}

export interface ProductReview {
    id: string;
    title: string;
    comment: string;
    rating: number;
    name: string;
    status: string;
    attachments: string;
}

export interface CreateProductReviewResponse {
    createProductReview: {
        productReview: ProductReview;
    };
}

export type ProductReviewResponse = CreateProductReviewResponse;
