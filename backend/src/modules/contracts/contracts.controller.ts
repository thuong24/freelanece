import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as contractsService from "./contracts.service";
import type {
  AcceptBidDto,
  SubmitDemoDto,
  SubmitFinalDto,
  RejectOrRevisionDto,
} from "./contracts.dto";

// POST /api/contracts/accept-bid
export const acceptBid = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as AcceptBidDto;
  const contract = await contractsService.acceptBid(req.user!.id, dto);
  return successResponse(res, "Đã tạo hợp đồng và ký quỹ thành công", contract, 201);
});

// GET /api/contracts
export const getContracts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  const { contracts, meta } = await contractsService.getContracts(req.user!.id, query);
  return successResponse(res, "Lấy danh sách hợp đồng thành công", contracts, 200, meta);
});

// GET /api/contracts/:id
export const getContractById = asyncHandler(async (req: Request, res: Response) => {
  const contract = await contractsService.getContractById(req.params.id, req.user!.id);
  return successResponse(res, "Lấy chi tiết hợp đồng thành công", contract);
});

// POST /api/contracts/:id/submit-demo
export const submitDemo = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as SubmitDemoDto;
  const contract = await contractsService.submitDemo(req.params.id, req.user!.id, dto);
  return successResponse(res, "Đã nộp bản demo thành công", contract);
});

// POST /api/contracts/:id/approve-demo
export const approveDemo = asyncHandler(async (req: Request, res: Response) => {
  const contract = await contractsService.approveDemo(req.params.id, req.user!.id);
  return successResponse(res, "Đã duyệt bản demo thành công", contract);
});

// POST /api/contracts/:id/reject-demo
export const rejectDemo = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as RejectOrRevisionDto;
  const contract = await contractsService.rejectDemo(req.params.id, req.user!.id, dto);
  return successResponse(res, "Đã từ chối bản demo", contract);
});

// POST /api/contracts/:id/submit-final
export const submitFinal = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as SubmitFinalDto;
  const contract = await contractsService.submitFinal(req.params.id, req.user!.id, dto);
  return successResponse(res, "Đã nộp source code thành công", contract);
});

// POST /api/contracts/:id/revision
export const requestRevision = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as RejectOrRevisionDto;
  const contract = await contractsService.requestRevision(req.params.id, req.user!.id, dto);
  return successResponse(res, "Đã yêu cầu sửa lại code", contract);
});

// POST /api/contracts/:id/accept
export const acceptContract = asyncHandler(async (req: Request, res: Response) => {
  const contract = await contractsService.acceptContract(req.params.id, req.user!.id);
  return successResponse(res, "Đã nghiệm thu hợp đồng và giải ngân thành công", contract);
});

// ── 5. Extension (Gia hạn) ──────────────────────────────────

export const requestExtension = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.requestExtension(req.params.id, req.user!.id, req.body);
  return successResponse(res, "Đã gửi yêu cầu gia hạn", result, 201);
});

export const approveExtension = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.approveExtension(req.params.id, req.user!.id);
  return successResponse(res, "Đã chấp thuận gia hạn", result);
});

export const rejectExtension = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.rejectExtension(req.params.id, req.user!.id);
  return successResponse(res, "Đã từ chối gia hạn", result);
});

// ── 6. Mutual Cancel (Hủy êm thấm) ──────────────────────────

export const requestMutualCancel = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.requestMutualCancel(req.params.id, req.user!.id, req.body);
  return successResponse(res, "Đã gửi yêu cầu hủy hợp đồng", result, 201);
});

export const approveMutualCancel = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.approveMutualCancel(req.params.id, req.user!.id);
  return successResponse(res, "Đã đồng ý hủy hợp đồng. Tiền đã được hoàn lại", result);
});

export const rejectMutualCancel = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.rejectMutualCancel(req.params.id, req.user!.id);
  return successResponse(res, "Đã từ chối hủy hợp đồng", result);
});

// ── 7. MIA & Force Cancel ───────────────────────────────────

export const pingFreelancer = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.pingFreelancer(req.params.id, req.user!.id);
  return successResponse(res, "Đã gửi cảnh báo đến freelancer", result);
});

export const forceCancel = asyncHandler(async (req: Request, res: Response) => {
  const result = await contractsService.forceCancel(req.params.id, req.user!.id);
  return successResponse(res, "Đã hủy hợp đồng đơn phương. Tiền đã được hoàn lại", result);
});
