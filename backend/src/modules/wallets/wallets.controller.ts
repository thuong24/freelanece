import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as walletsService from "./wallets.service";
import type { GetTransactionsQueryDto, DepositDto, WithdrawDto } from "./wallets.dto";

// GET /api/wallets/me
export const getMyWallet = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await walletsService.getMyWallet(req.user!.id);
  return successResponse(res, "Lấy thông tin ví thành công", wallet);
});

// GET /api/wallets/transactions
export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetTransactionsQueryDto;
  const { transactions, meta } = await walletsService.getMyTransactions(req.user!.id, query);
  return successResponse(res, "Lấy lịch sử giao dịch thành công", transactions, 200, meta);
});

// POST /api/wallets/deposit
export const deposit = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as DepositDto;
  const result = await walletsService.deposit(req.user!.id, dto);
  return successResponse(res, "Nạp tiền thành công", result, 201);
});

// POST /api/wallets/withdraw
export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as WithdrawDto;
  const result = await walletsService.withdraw(req.user!.id, dto);
  return successResponse(res, "Yêu cầu rút tiền đã được ghi nhận", result);
});
