export type JobStatus = "OPEN" | "ASSIGNED" | "CLOSED";
export type CodeQualityRequirement = "FUNCTIONAL_ONLY" | "CLEAN_CODE" | "CLEAN_CODE_WITH_COMMENTS";

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: string;
  deadlineDays: number;
  status: JobStatus;
  isBumped: boolean;
  bumpedAt: string | null;
  codeQualityRequirement: CodeQualityRequirement;
  screeningQuestion: string | null;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; ratingAvg: number; avatarUrl: string | null };
}

export interface CreateJobInput {
  title: string;
  description: string;
  budget: number;
  deadlineDays: number;
  codeQualityRequirement?: CodeQualityRequirement;
  screeningQuestion?: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  minBudget?: number;
  maxBudget?: number;
  sortBy?: "bumped" | "newest" | "budget_asc" | "budget_desc";
}
