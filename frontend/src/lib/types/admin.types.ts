export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalContracts: number;
  platformRevenue: string | number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  ratingAvg: number;
  wallet: { availableBalance: string; lockedBalance: string } | null;
}
