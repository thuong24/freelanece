import api from "./axios";
import type { Job, CreateJobInput, JobFilters } from "@/lib/types/job.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const jobsApi = {
  getJobs: (filters?: JobFilters) =>
    api.get<ApiResponse<Job[]> & { meta: PaginationMeta }>("/jobs", { params: filters }),

  getJob: (id: string) =>
    api.get<ApiResponse<Job>>(`/jobs/${id}`),

  createJob: (data: CreateJobInput) =>
    api.post<ApiResponse<Job>>("/jobs", data),

  updateJob: (id: string, data: Partial<CreateJobInput>) =>
    api.patch<ApiResponse<Job>>(`/jobs/${id}`, data),

  deleteJob: (id: string) =>
    api.delete<ApiResponse<null>>(`/jobs/${id}`),

  bumpJob: (id: string) =>
    api.post<ApiResponse<Job>>(`/jobs/${id}/bump`),
};
