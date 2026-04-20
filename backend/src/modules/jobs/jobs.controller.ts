import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as jobsService from "./jobs.service";
import type { CreateJobDto, UpdateJobDto, GetJobsQueryDto } from "./jobs.dto";

// POST /api/jobs
export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as CreateJobDto;
  const job = await jobsService.createJob(req.user!.id, dto);
  return successResponse(res, "Đăng bài thành công", job, 201);
});

// GET /api/jobs
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetJobsQueryDto;
  const { jobs, meta } = await jobsService.getJobs(query);
  return successResponse(res, "Lấy danh sách bài đăng thành công", jobs, 200, meta);
});

// GET /api/jobs/my
export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  };
  const { jobs, meta } = await jobsService.getMyJobs(req.user!.id, query);
  return successResponse(res, "Lấy danh sách bài đăng của bạn thành công", jobs, 200, meta);
});

// GET /api/jobs/:id
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobsService.getJobById(req.params.id);
  return successResponse(res, "Lấy chi tiết bài đăng thành công", job);
});

// PATCH /api/jobs/:id
export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as UpdateJobDto;
  const job = await jobsService.updateJob(req.params.id, req.user!.id, dto);
  return successResponse(res, "Cập nhật bài đăng thành công", job);
});

// DELETE /api/jobs/:id
export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  await jobsService.deleteJob(req.params.id, req.user!.id);
  return successResponse(res, "Xóa bài đăng thành công");
});

// POST /api/jobs/:id/bump
export const bumpJob = asyncHandler(async (req: Request, res: Response) => {
  const result = await jobsService.bumpJob(req.params.id, req.user!.id);
  return successResponse(res, "Đẩy top bài đăng thành công", result);
});
