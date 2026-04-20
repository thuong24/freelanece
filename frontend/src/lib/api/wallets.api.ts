import api from "./axios";
import type { Wallet, WalletTransaction } from "@/lib/types/wallet.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const walletsApi = {
  getMyWallet: () =>
    api.get<ApiResponse<Wallet>>("/wallets/me"),

  getTransactions: (params?: { page?: number; limit?: number; sortOrder?: "asc" | "desc" }) =>
    api.get<ApiResponse<WalletTransaction[]> & { meta: PaginationMeta }>("/wallets/transactions", { params }),

  deposit: (data: any) =>
    api.post<ApiResponse<any>>("/wallets/deposit", data),

  withdraw: (data: any) =>
    api.post<ApiResponse<any>>("/wallets/withdraw", data),
};
