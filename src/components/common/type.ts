export interface NextImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}


export interface RatingTypes {
  length?: number;
  star: number;
  reviewCount?: number;
  size?: string;
  className?: string;
  totalReview?: number;
  onReviewClick?: () => void;
}