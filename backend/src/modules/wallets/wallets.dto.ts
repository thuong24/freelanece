import { z } from "zod";

// Schema query lịch sử giao dịch
export const GetTransactionsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: z
    .enum([
      "DEPOSIT",
      "WITHDRAW",
      "ESCROW_LOCK",
      "ESCROW_RELEASE",
      "REFUND",
      "LATE_PENALTY",
      "PLATFORM_FEE",
      "MILESTONE_RELEASE",
      "BONUS",
    ])
    .optional(),
  from: z.string().datetime({ message: "Ngày bắt đầu không hợp lệ" }).optional(),
  to: z.string().datetime({ message: "Ngày kết thúc không hợp lệ" }).optional(),
});

// Schema nạp tiền (webhook từ cổng thanh toán)
export const DepositSchema = z.object({
  amount: z.number().positive("Số tiền nạp phải lớn hơn 0"),
  paymentGateway: z.enum(["VNPAY", "MOMO"], {
    errorMap: () => ({ message: "Cổng thanh toán không hợp lệ" }),
  }),
  gatewayTransactionId: z.string().min(1, "Mã giao dịch không hợp lệ"),
  gatewaySignature: z.string().min(1, "Chữ ký xác thực không hợp lệ"),
});

// Schema rút tiền
export const WithdrawSchema = z.object({
  amount: z
    .number()
    .positive("Số tiền rút phải lớn hơn 0")
    .min(50000, "Số tiền rút tối thiểu là 50,000 VNĐ"),
  bankName: z.string().min(1, "Tên ngân hàng không được để trống").max(100),
  bankAccountNumber: z
    .string()
    .min(6, "Số tài khoản không hợp lệ")
    .max(30, "Số tài khoản không hợp lệ")
    .regex(/^\d+$/, "Số tài khoản chỉ được chứa chữ số"),
  bankAccountName: z
    .string()
    .min(2, "Tên chủ tài khoản không hợp lệ")
    .max(100)
    .trim()
    .toUpperCase(),
});

export type GetTransactionsQueryDto = z.infer<typeof GetTransactionsQuerySchema>;
export type DepositDto = z.infer<typeof DepositSchema>;
export type WithdrawDto = z.infer<typeof WithdrawSchema>;
