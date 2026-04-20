// Thêm N ngày vào một mốc thời gian
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Thêm N giờ vào một mốc thời gian
export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

// Tính số giờ chênh lệch giữa 2 thời điểm (luôn dương)
export const diffInHours = (from: Date, to: Date): number => {
  return Math.abs((to.getTime() - from.getTime()) / (1000 * 60 * 60));
};

// Tính số ngày trễ so với deadline (trả về 0 nếu chưa trễ)
export const calcLateDays = (deadlineAt: Date, now: Date = new Date()): number => {
  if (now <= deadlineAt) return 0;
  const diffMs = now.getTime() - deadlineAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

// Kiểm tra đã qua N giờ kể từ mốc thời gian
export const isOlderThanHours = (date: Date, hours: number): boolean => {
  return diffInHours(date, new Date()) >= hours;
};

// Trả về ngày đầu tiên của tháng hiện tại lúc 00:00:00
export const startOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};
