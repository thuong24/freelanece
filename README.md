<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License" />
  <br />
  <br />

  # 🌟 Freelance Escrow Platform

  **Nền tảng kết nối Freelancer và Khách hàng với hệ thống Thanh toán Ký quỹ (Escrow) an toàn tuyệt đối.**

  <br />
</div>

## 📖 Giới thiệu

**Freelance Escrow** là một ứng dụng web marketplace hiện đại, nơi mọi người có thể đăng tải các dự án (Job) cần tìm người làm, hoặc đấu thầu (Bid) để nhận các dự án đó. 

Điểm nổi bật nhất của nền tảng là **Hệ thống Ký quỹ (Escrow)**: Khi một hợp đồng được ký kết, tiền của Khách hàng sẽ được "giam" (locked) an toàn trên hệ thống. Số tiền này chỉ được giải ngân cho Freelancer khi công việc đã được nghiệm thu thành công. Điều này bảo vệ quyền lợi tuyệt đối cho cả hai bên, loại bỏ hoàn toàn rủi ro lừa đảo.

---

## ✨ Tính năng nổi bật (Features)

*   🔄 **Tài khoản Hybrid (2 trong 1)**: Một tài khoản duy nhất có thể vừa đóng vai trò Khách hàng (đăng việc), vừa đóng vai trò Freelancer (nhận việc).
*   💳 **Hệ thống Ví & Ký quỹ (Wallet & Escrow)**:
    *   Quản lý số dư khả dụng (`available balance`) và số dư đang bị giam (`locked balance`).
    *   Thanh toán an toàn: Tiền bị giam khi bắt đầu hợp đồng và chỉ tự động giải ngân khi nghiệm thu.
*   📌 **Bảng Công Việc & Đấu Thầu (Job Board & Bidding)**:
    *   Đăng việc dễ dàng, thuật toán ưu tiên đẩy top bài viết.
    *   Freelancer tham gia đấu giá (Bidding) kèm theo lời nhắn và ước tính thời gian.
*   🤝 **Quản lý Hợp Đồng (Contract Management)**:
    *   Theo dõi tiến độ chi tiết (Từ khi Bắt đầu -> Nộp Demo -> Nộp Source -> Hoàn thành).
    *   Hỗ trợ xin gia hạn thời gian (Extension) hoặc thỏa thuận hủy hợp đồng (Mutual Cancel).
*   ⚖️ **Hệ thống Phân xử Khiếu nại (Dispute Resolution)**:
    *   Cho phép người dùng mở khiếu nại nếu có bất đồng.
    *   Admin có công cụ phân xử, chia tỷ lệ hoàn tiền và giải phóng quỹ linh hoạt.
*   🔔 **Thông báo & Chat theo thời gian thực**: Cập nhật ngay lập tức mọi thay đổi về hợp đồng và tin nhắn qua hệ thống thông báo.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

Dự án được xây dựng với kiến trúc **Client - Server** tách biệt, sử dụng các công nghệ hiện đại nhất:

### 🌐 Frontend
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/)
*   **Ngôn ngữ:** TypeScript
*   **Giao diện (UI):** [Tailwind CSS v4](https://tailwindcss.com/) kết hợp với `lucide-react` cho icons. Giao diện được thiết kế theo phong cách Glassmorphism, Dark mode hiện đại và mượt mà.
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Auth Store) & [@tanstack/react-query](https://tanstack.com/query/latest) (Data Fetching, Caching).
*   **Forms & Validation:** `react-hook-form` + `zod`.
*   **Xác thực:** Google One Tap Login.

### ⚙️ Backend
*   **Core:** [Node.js](https://nodejs.org/) & [Express v5](https://expressjs.com/)
*   **Ngôn ngữ:** TypeScript
*   **Cơ sở dữ liệu:** **MySQL** thông qua ORM mạnh mẽ [Prisma (v5.22)](https://www.prisma.io/).
*   **Background Jobs & Queues:** [BullMQ](https://docs.bullmq.io/) + [Redis](https://redis.io/) (Xử lý các tác vụ nền như tự động giải ngân, phạt trễ hạn, reset quota).
*   **Security & Auth:** JSON Web Tokens (JWT) lưu trữ qua `HTTP-only Cookies` an toàn tuyệt đối.
*   **Validation:** DTO Validation bằng `zod`.

---

## 🚀 Hướng dẫn cài đặt & Triển khai (Local Development)

### Yêu cầu hệ thống:
*   Node.js (v20 trở lên)
*   MySQL Server
*   Redis Server (Đang chạy ở cổng mặc định 6379)

### 1. Cài đặt Backend
```bash
cd backend
npm install
```
**Cấu hình `.env`:** Copy file `.env.example` thành `.env` và cấu hình các biến môi trường (DATABASE_URL, JWT_SECRET, REDIS_URL,...).

**Khởi tạo Database:**
```bash
npm run db:push
npm run db:seed  # (Tùy chọn: Để tạo dữ liệu mẫu)
```

**Chạy Server:**
```bash
npm run dev
# Server sẽ chạy tại http://localhost:3000
```

### 2. Cài đặt Frontend
```bash
cd frontend
npm install
```
**Cấu hình `.env.local`:** Khai báo các URL kết nối đến Backend và Google Client ID.
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Chạy Client:**
```bash
npm run dev
# Mở trình duyệt tại http://localhost:3001 (hoặc cổng tương ứng)
```

---

## 🔒 Kiến trúc Bảo mật & Middleware
*   **Bảo mật API:** Backend được bảo vệ bởi `helmet`, `express-rate-limit`, và CORS được cấu hình nghiêm ngặt.
*   **Next.js Proxy/Middleware:** Frontend sử dụng Next.js Middleware chạy tại Edge Runtime để kiểm tra Cookie và phân quyền truy cập linh hoạt, ngăn chặn các luồng truy cập trái phép vào Dashboard/Admin.
*   **Xử lý Cookie Cross-Domain:** Hỗ trợ đầy đủ việc cấu hình `SameSite=None` và `Secure` để Cookie HTTP-only vẫn hoạt động trơn tru khi deploy Backend và Frontend ở 2 tên miền khác nhau (vd: Vercel & Render).

---

<div align="center">
  <p>Được phát triển với ❤️ bởi <b>Thuong24</b></p>
</div>