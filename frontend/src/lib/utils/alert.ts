// Centralized Alert utility wrapping SweetAlert2 with custom dark theme
import Swal from "sweetalert2";

const baseConfig = {
  background: "#1e293b",
  color: "#f1f5f9",
  confirmButtonColor: "#6366f1",
  cancelButtonColor: "#475569",
  focusConfirm: false,
  showClass: { popup: "animate__animated animate__fadeIn animate__faster" },
  hideClass: { popup: "animate__animated animate__fadeOut animate__faster" },
};

const DangerConfig = {
  ...baseConfig,
  confirmButtonColor: "#ef4444",
};

export const Alert = {
  // ─── Simple toast notifications ───────────────────────────────
  toast: (title: string, icon: "success" | "error" | "warning" | "info" = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      icon,
      title,
      background: icon === "success" ? "#052e16" : icon === "error" ? "#2d0a0a" : "#1e293b",
      color: icon === "success" ? "#4ade80" : icon === "error" ? "#f87171" : "#f1f5f9",
      iconColor: icon === "success" ? "#22c55e" : icon === "error" ? "#ef4444" : "#f59e0b",
    }),

  // ─── Error popup ─────────────────────────────────────────────
  error: (message: string) =>
    Swal.fire({
      ...baseConfig,
      icon: "error",
      title: "Có lỗi xảy ra",
      text: message,
      confirmButtonText: "Đóng",
      iconColor: "#ef4444",
    }),

  // ─── Generic confirm ─────────────────────────────────────────
  confirm: (title: string, text?: string) =>
    Swal.fire({
      ...baseConfig,
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
    }),

  // ─── Escrow lock confirmation ─────────────────────────────────
  escrowConfirm: (amount: string) =>
    Swal.fire({
      ...baseConfig,
      icon: "warning",
      iconColor: "#f59e0b",
      title: "🔒 Xác nhận giam tiền Escrow",
      html: `<div style="color:#94a3b8;font-size:14px">
        <p>Số tiền <strong style="color:#fbbf24">${amount}</strong> sẽ bị <strong>khóa vào Escrow</strong></p>
        <p style="margin-top:8px">Tiền chỉ được giải ngân khi bạn <strong>nghiệm thu</strong> hợp đồng hoặc Admin phân xử.</p>
        <p style="margin-top:8px;color:#ef4444;font-size:12px">⚠️ Đây là cam kết ràng buộc — không thể hoàn tiền đơn phương.</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "🔒 Đồng ý giam tiền",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#d97706",
    }),

  // ─── Release/accept confirmation ─────────────────────────────
  releaseConfirm: (amount: string) =>
    Swal.fire({
      ...baseConfig,
      icon: "success",
      iconColor: "#22c55e",
      title: "💰 Nghiệm thu & Giải ngân",
      html: `<div style="color:#94a3b8;font-size:14px">
        <p>Bạn xác nhận <strong style="color:#4ade80">nghiệm thu</strong> kết quả từ Freelancer.</p>
        <p style="margin-top:8px">Số tiền <strong style="color:#4ade80">${amount}</strong> sẽ được giải ngân cho Freelancer <strong>ngay lập tức</strong>.</p>
        <p style="margin-top:8px;color:#f59e0b;font-size:12px">⚠️ Sau khi nghiệm thu, hợp đồng sẽ kết thúc và không thể khiếu nại.</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "✅ Xác nhận nghiệm thu",
      cancelButtonText: "Kiểm tra lại",
      confirmButtonColor: "#16a34a",
    }),

  // ─── Cancel confirmation ──────────────────────────────────────
  cancelConfirm: () =>
    Swal.fire({
      ...DangerConfig,
      icon: "warning",
      iconColor: "#ef4444",
      title: "🚫 Đề nghị hủy hợp đồng?",
      html: `<div style="color:#94a3b8;font-size:14px">
        <p>Yêu cầu hủy sẽ được gửi đến đối tác. Hợp đồng chỉ bị hủy khi <strong>cả hai đồng ý</strong>.</p>
        <p style="margin-top:8px;color:#4ade80">Tiền sẽ được hoàn 100% về Client.</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "🚫 Gửi đề nghị hủy",
      cancelButtonText: "Quay lại",
    }),

  // ─── Dispute confirmation ─────────────────────────────────────
  disputeConfirm: () =>
    Swal.fire({
      ...DangerConfig,
      icon: "warning",
      iconColor: "#ef4444",
      title: "⚖️ Mở khiếu nại?",
      html: `<div style="color:#94a3b8;font-size:14px">
        <p>Tiền trong Escrow sẽ bị <strong style="color:#ef4444">đóng băng</strong> cho đến khi Admin phân xử.</p>
        <p style="margin-top:8px">Hãy cung cấp <strong>bằng chứng rõ ràng</strong> để hỗ trợ quyết định phân xử.</p>
        <p style="margin-top:8px;color:#f59e0b;font-size:12px">⚠️ Khiếu nại sai sự thật có thể dẫn đến tài khoản bị phạt.</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "⚖️ Xác nhận mở khiếu nại",
      cancelButtonText: "Huỷ",
    }),
};
