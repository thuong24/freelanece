// Formatting utility functions

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  if (weeks < 4) return `${weeks} tuần trước`;
  if (months < 12) return `${months} tháng trước`;
  return formatDate(date);
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

export const truncate = (text: string, length: number): string => {
  return text.length > length ? `${text.slice(0, length)}...` : text;
};
