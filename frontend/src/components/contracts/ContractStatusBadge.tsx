import type { ContractStatus } from "@/lib/types/contract.types";
import { Badge } from "@/components/ui/Badge";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "purple" | "default";

const config: Record<ContractStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: "Chờ xử lý", variant: "default" },
  IN_PROGRESS: { label: "Đang thực hiện", variant: "info" },
  WAITING_DEMO_APPROVAL: { label: "Chờ duyệt Demo", variant: "warning" },
  WAITING_SOURCE_CODE: { label: "Chờ nộp Source", variant: "warning" },
  WAITING_FOR_REVIEW: { label: "Chờ nghiệm thu", variant: "purple" },
  REVISION_REQUESTED: { label: "Cần chỉnh sửa", variant: "warning" },
  DISPUTED: { label: "Đang tranh chấp", variant: "danger" },
  DONE: { label: "Hoàn thành", variant: "success" },
  CANCELLED: { label: "Đã hủy", variant: "default" },
  EXPIRED: { label: "Hết hạn", variant: "danger" },
};

export const ContractStatusBadge = ({ status }: { status: ContractStatus }) => {
  const { label, variant } = config[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
};
