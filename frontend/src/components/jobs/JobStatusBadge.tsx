import type { JobStatus } from "@/lib/types/job.types";
import { Badge } from "@/components/ui/Badge";

const statusConfig: Record<JobStatus, { label: string; variant: "success" | "info" | "default" }> = {
  OPEN: { label: "Đang mở", variant: "success" },
  ASSIGNED: { label: "Đã chốt", variant: "info" },
  CLOSED: { label: "Đã đóng", variant: "default" },
};

export const JobStatusBadge = ({ status }: { status: JobStatus }) => {
  const { label, variant } = statusConfig[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
};
