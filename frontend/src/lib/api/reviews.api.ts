import api from "./axios";
import type { Review } from "@/lib/types/chat.types";
import type { ApiResponse } from "@/lib/types/api.types";

export const reviewsApi = {
  createReview: (data: {
    contractId: string;
    codeQualityScore: number;
    communicationScore: number;
    speedScore: number;
    comment?: string;
  }) =>
    api.post<ApiResponse<Review>>("/reviews", data),
};
