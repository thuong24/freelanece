# Freelance Escrow Platform Backend

Backend cho nền tảng sàn giao dịch code thuê, hỗ trợ đăng ký/đăng nhập bằng JWT và Google One Tap, ví điện tử, job board, bidding, escrow, timeline, bàn giao, tranh chấp, chat nội bộ và cronjob xử lý tự động.

## 1. Mục tiêu hệ thống

Hệ thống backend cần đáp ứng các yêu cầu sau:

- Tổ chức code nhất quán, dễ bảo trì, dễ tái sử dụng.
- Xử lý ngoại lệ đầy đủ, tránh dừng server đột ngột.
- Toàn bộ lỗi trả về cho người dùng bằng tiếng Việt.
- Tất cả API dạng danh sách đều có phân trang.
- Hỗ trợ đăng ký, đăng nhập bằng JWT và Google One Tap.
- Refresh token được lưu trong cookie HttpOnly và kiểm tra đối chiếu với database.
- Database sử dụng MySQL, user `root`, không có password, database tên `freelanece_db`.
- Luồng tiền phải dùng transaction để đảm bảo tính toàn vẹn dữ liệu.
- Các tác vụ nền như reset quota, auto-release, penalty, ping MIA, xử lý dispute phải chạy qua cronjob hoặc queue worker.

## 2. Công nghệ đề xuất

- Node.js
- Express.js
- Prisma
- MySQL
- JWT
- Google One Tap
- Redis + BullMQ cho job queue
- Multer hoặc storage service cho upload file
- Zod hoặc Joi cho validation
- Winston hoặc Pino cho logging

## 3. Nguyên tắc kiến trúc

Backend nên theo mô hình modular monolith:

`Route -> Controller -> Service -> Repository -> Prisma/MySQL`

### Trách nhiệm từng lớp

- Route: khai báo endpoint.
- Controller: nhận request, gọi validation, trả response.
- Service: xử lý business logic.
- Repository: truy vấn database.
- Middleware: auth, phân trang, validate, error handler, rate limit.
- Worker/Cron: xử lý tác vụ nền.

## 4. Cấu trúc thư mục

```bash
src/
  app.ts
  server.ts

  config/
    env.ts
    prisma.ts
    jwt.ts
    queue.ts

  common/
    constants/
    errors/
    middlewares/
    pagination/
    response/
    utils/
    validators/

  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.repository.ts
      auth.dto.ts
      auth.types.ts

    users/
    wallets/
    jobs/
    bids/
    contracts/
    timelines/
    chats/
    disputes/
    notifications/
    reviews/
    admin/

  jobs/
    cron/
    workers/
    processors/

  prisma/
    schema.prisma
    migrations/

  uploads/
  logs/
```

## 5. Quy ước code

- Tên file dùng `kebab-case.ts`.
- Tên class và service dùng `PascalCase`.
- Tên biến và hàm dùng `camelCase`.
- Endpoint REST thống nhất và rõ ràng.
- Response của API dùng một format duy nhất.
- Không để controller xử lý business logic.
- Không query database trực tiếp trong controller.

## 6. Chuẩn response API

### Response thành công

```json
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### Response lỗi

```json
{
  "success": false,
  "message": "Không thể tạo hợp đồng",
  "error": {
    "code": "CONTRACT_LOCK_FAILED",
    "details": []
  }
}
```

### Quy ước message lỗi

- Code lỗi nội bộ có thể dùng tiếng Anh ngắn gọn.
- Message trả về cho người dùng phải là tiếng Việt.
- Không để lỗi kỹ thuật thô lộ ra ngoài.

## 7. Authentication

### 7.1 Đăng nhập JWT

Luồng đăng nhập:

1. Client gửi email/password.
2. Server xác thực thông tin.
3. Server trả về:
   - `accessToken`
   - `refreshToken` được set vào cookie `HttpOnly`
4. Client dùng `accessToken` để gọi API.

### 7.2 Refresh token

Khi `accessToken` hết hạn:

1. Client gọi `/refresh-token`.
2. Server đọc refresh token từ cookie.
3. Server đối chiếu refresh token trong database.
4. Nếu hợp lệ, server cấp access token mới và có thể rotate refresh token.

### 7.3 Logout

Luồng logout:

1. Xoá refresh token trong database.
2. Clear cookie refresh token.
3. Client xoá access token ở local state.

### 7.4 Google One Tap

Luồng đăng nhập Google:

1. Client lấy `credential` từ Google One Tap.
2. Server verify token với Google.
3. Server tìm user theo `google_id` hoặc email.
4. Nếu chưa có user thì tạo mới.
5. Trả về `accessToken` và `refreshToken` như luồng đăng nhập thường.

## 8. Database

### 8.1 Thông tin kết nối

- MySQL
- user: `root`
- password: rỗng
- database: `freelanece_db`

Ví dụ `.env`:

```env
DATABASE_URL="mysql://root@localhost:3306/freelanece_db"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
REDIS_URL="redis://localhost:6379"
```

### 8.2 Bảng dữ liệu lõi

#### users
- id
- name
- email
- password_hash
- google_id
- role
- rating
- status
- avatar_url
- created_at
- updated_at

#### wallets
- id
- user_id
- available_balance
- locked_balance
- currency
- created_at
- updated_at

#### wallet_transactions
- id
- wallet_id
- type
- amount
- before_balance
- after_balance
- reference_type
- reference_id
- description
- created_at

Bảng này là immutable theo nghiệp vụ. Không cho phép xóa vật lý.

#### jobs
- id
- client_id
- title
- description
- budget
- status
- is_bumped
- free_quota_used
- created_at
- updated_at

#### bids
- id
- job_id
- freelancer_id
- bid_amount
- estimated_days
- message
- status
- created_at
- updated_at

#### contracts
- id
- job_id
- client_id
- freelancer_id
- bid_id
- status
- budget
- locked_amount
- penalty_amount
- deadline_at
- submitted_at
- reviewed_at
- completed_at
- created_at
- updated_at

#### timelines
- id
- contract_id
- percent
- title
- note
- attachments_json
- created_by
- created_at

#### disputes
- id
- contract_id
- opened_by
- reason
- status
- admin_decision
- resolved_at
- created_at
- updated_at

#### refresh_tokens
- id
- user_id
- token_hash
- expires_at
- revoked_at
- device_info
- created_at
- updated_at

## 9. Module hệ thống

## 9.1 User và Wallet

Chức năng:
- tạo và cập nhật profile
- quản lý rating/review
- lưu số dư coin
- nạp tiền
- rút tiền
- lưu lịch sử giao dịch không thể xóa

Nguyên tắc:
- `available_balance` là số dư khả dụng.
- `locked_balance` là số tiền bị giam trong escrow.
- Mọi thay đổi số dư phải chạy trong transaction.

## 9.2 Job và Bidding

Chức năng:
- tạo job
- hiển thị danh sách job
- đẩy top
- bid vào job
- lọc, tìm kiếm, sắp xếp, phân trang

Nguyên tắc:
- Job list luôn có phân trang.
- Bài được đẩy top phải được ưu tiên sắp xếp trước.
- Hết quota đăng bài hoặc bid thì phải báo rõ bằng tiếng Việt.

## 9.3 Escrow

Chức năng:
- khóa tiền khi chốt deal
- chuyển từ `available_balance` sang `locked_balance`
- tạo contract
- giải ngân khi nghiệm thu
- hoàn tiền khi dispute hoặc hủy hợp đồng

Nguyên tắc:
- Escrow là trung tâm của hệ thống.
- Không được thao tác tiền ngoài database transaction.
- Không được để server crash giữa chừng khi xử lý tiền.

## 9.4 Tracking và Timeline

Chức năng:
- freelancer cập nhật tiến độ theo phần trăm hoặc milestone
- đính kèm ảnh, link, ghi chú
- client nhận thông báo realtime

Nguyên tắc:
- Mỗi lần update timeline phải ghi log.
- Timeline là một phần của lịch sử xử lý contract.

## 9.5 Delivery và Revision

Chức năng:
- submit demo
- approve demo
- submit final source code
- revision request
- approve completion
- auto release sau thời gian chờ nếu client im lặng

Nguyên tắc:
- Trạng thái contract phải rõ ràng.
- Mỗi bước chỉ cho phép khi contract đang ở trạng thái hợp lệ.
- Sau khi submit final, ghi lại `submitted_at` để cronjob auto-release.

## 9.6 Dispute

Chức năng:
- tạo ticket tranh chấp
- xem chat, timeline, file đính kèm
- admin phân xử
- hoàn tiền hoặc giải ngân theo quyết định

Nguyên tắc:
- Contract chuyển sang `DISPUTED` khi có khiếu nại.
- Tiền vẫn bị giam cho đến khi có quyết định cuối cùng.
- Mọi quyết định của admin phải được log lại.

## 10. Trạng thái contract

Nên chuẩn hóa enum:

```ts
PENDING
IN_PROGRESS
WAITING_FOR_REVIEW
REVISION_REQUESTED
DISPUTED
DONE
CANCELLED
EXPIRED
```

Nếu có milestone thì có thể bổ sung thêm trạng thái riêng cho từng mốc.

## 11. API flow chính

## 11.1 Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google-one-tap`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`

## 11.2 Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/:id`

Tất cả endpoint danh sách phải hỗ trợ phân trang nếu có trả mảng.

## 11.3 Wallets

- `GET /api/wallets/me`
- `GET /api/wallets/transactions?page=1&limit=20`
- `POST /api/wallets/deposit`
- `POST /api/wallets/withdraw`

## 11.4 Jobs

- `POST /api/jobs`
- `GET /api/jobs?page=1&limit=20`
- `GET /api/jobs/:id`
- `PATCH /api/jobs/:id`
- `POST /api/jobs/:id/bump`

## 11.5 Bids

- `POST /api/jobs/:id/bids`
- `GET /api/jobs/:id/bids?page=1&limit=20`
- `PATCH /api/bids/:id`
- `DELETE /api/bids/:id`

## 11.6 Contracts

- `POST /api/contracts/:id/accept-bid`
- `POST /api/contracts/:id/timelines`
- `POST /api/contracts/:id/submit-demo`
- `POST /api/contracts/:id/approve-demo`
- `POST /api/contracts/:id/submit-final`
- `POST /api/contracts/:id/revision`
- `POST /api/contracts/:id/accept`
- `POST /api/contracts/:id/dispute`
- `POST /api/contracts/:id/mutual-cancel`

## 11.7 Admin

- `GET /api/admin/disputes?page=1&limit=20`
- `POST /api/admin/disputes/:id/resolve`
- `POST /api/admin/users/:id/ban`

## 12. Pagination

Tất cả API list phải hỗ trợ:

- `page`
- `limit`
- `sortBy`
- `sortOrder`
- `search`
- `status`
- `from`
- `to`

Ví dụ:

```http
GET /api/jobs?page=1&limit=20&sortBy=createdAt&sortOrder=desc
GET /api/contracts?page=2&limit=10&status=IN_PROGRESS
GET /api/wallets/transactions?page=1&limit=50
```

Nếu endpoint chỉ trả về một object đơn lẻ thì không cần pagination.

## 13. Xử lý ngoại lệ

### 13.1 Mục tiêu

- Không để server dừng đột ngột.
- Không để lỗi kỹ thuật lộ ra ngoài.
- Trả lỗi có cấu trúc rõ ràng.

### 13.2 Cần có

- async handler cho controller bất đồng bộ
- global error middleware
- custom error classes
- validate request body/query/params
- catch lỗi Prisma
- process handler cho `uncaughtException`
- process handler cho `unhandledRejection`

### 13.3 Nhóm lỗi nên chuẩn hóa

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`
- `ValidationError`
- `BusinessRuleError`
- `InternalServerError`

## 14. Cronjob và worker

Các tác vụ nền nên tách riêng khỏi API.

### 14.1 Late penalty cron

Chạy mỗi 1 giờ.

- Tìm contract `IN_PROGRESS`
- Kiểm tra `deadline_at < NOW()`
- Tính số ngày trễ
- Cập nhật `total_penalty_amount`
- Gửi notification cho client và freelancer

### 14.2 Auto release cron

Chạy mỗi 30 phút.

- Tìm contract `WAITING_FOR_REVIEW`
- Nếu quá 72 giờ kể từ `submitted_at` mà client chưa phản hồi
- Tự động chuyển sang `DONE`
- Giải ngân tiền cho freelancer

### 14.3 MIA tracker cron

Chạy mỗi 12 giờ.

- Tìm freelancer không cập nhật tiến độ quá 48 giờ
- Bật trạng thái cảnh báo
- Gửi ping cho client

### 14.4 Monthly reset cron

Chạy lúc 00:00 ngày 1 hàng tháng.

- Reset `free_post_count`
- Reset `free_bid_count`

### 14.5 Nên dùng

- BullMQ + Redis nếu muốn ổn định và mở rộng
- node-cron nếu giai đoạn đầu đơn giản

## 15. Transaction rules cho tiền

Các luồng sau bắt buộc dùng database transaction:

- deposit
- withdraw
- accept bid / escrow lock
- release escrow
- refund
- penalty
- milestone release
- dispute resolution

Nguyên tắc:

- Tất cả thay đổi balance và log phải thành công cùng nhau.
- Nếu một bước lỗi, rollback toàn bộ.
- Không được cập nhật balance ở nhiều nơi rời rạc.

## 16. Business logic gợi ý

## 16.1 Deadline và penalty

- Khi client chấp nhận bid, hệ thống sinh `deadline_at` bằng thời điểm hiện tại cộng số ngày cam kết.
- Nếu trễ hạn, phạt theo phần trăm giá trị hợp đồng.
- Tiền phạt hoàn về ví client như khoản đền bù.
- Có thể đặt cap tối đa mức phạt.

## 16.2 Extension request

- Freelancer có thể xin gia hạn.
- Client đồng ý thì dời `deadline_at`.
- Không tính phạt trong thời gian được gia hạn.

## 16.3 Hold rút tiền

- Tiền vừa nhận có thể bị hold một khoảng thời gian trước khi rút.
- Khi hold chưa hết, không cho withdraw.

## 16.4 Anti-bypass chat

- Chat nội bộ nên có bộ lọc từ khóa liên quan số điện thoại, Zalo, chuyển khoản, bank.
- Nếu phát hiện vi phạm nhiều lần thì khóa bid hoặc đăng bài trong 24 giờ.

## 16.5 Warranty period

- Có thể giữ tiền vừa giải ngân trong một khoảng thời gian trước khi cho rút.
- Hữu ích cho trường hợp tranh chấp phát sinh sau nghiệm thu.

## 17. Logging và audit trail

Hệ thống nên lưu log cho các sự kiện quan trọng:

- đăng ký, đăng nhập
- refresh token
- deposit, withdraw
- tạo job, bump job
- tạo bid
- accept bid
- tạo contract
- submit demo, submit final
- revision, dispute, resolve dispute
- cronjob tự động thay đổi trạng thái

Mục tiêu là có thể truy vết đầy đủ khi xảy ra tranh chấp.

## 18. Validation

Tất cả input cần validate:

- email hợp lệ
- password đủ mạnh
- amount là số dương
- page và limit hợp lệ
- status thuộc enum cho phép
- file/link đính kèm đúng định dạng
- contract id, bid id, job id phải tồn tại

Không tin dữ liệu từ client.

## 19. Notification

Nên hỗ trợ:

- realtime notification
- email notification
- system notification
- unread count

Các event chính:

- có bid mới
- có timeline mới
- có request sửa
- có submit final
- có dispute mới
- hợp đồng sắp trễ
- auto release
- admin xử lý tranh chấp

## 20. Gợi ý thứ tự triển khai

Nên build theo thứ tự sau:

1. auth và users
2. wallet và transaction logs
3. jobs và bids
4. contracts và escrow
5. timelines và notifications
6. disputes và admin
7. cronjobs và auto processing
8. chat nội bộ và anti-bypass filter

## 21. Yêu cầu bắt buộc khi phát triển

- Không được làm API không có phân trang nếu API trả danh sách.
- Không được để lỗi hệ thống vỡ ra ngoài.
- Không được ghi tiền ngoài transaction.
- Không được lưu refresh token raw nếu có thể tránh.
- Không được để code của controller phình to.
- Không được để cronjob nằm chung với request handler.
- Không được trả lỗi tiếng Anh cho người dùng cuối.

## 22. Kết luận

Đây là backend cho một nền tảng freelance escrow cần mức độ ổn định cao, data integrity cao và khả năng xử lý tranh chấp rõ ràng. Kiến trúc module hóa, transaction cho tiền, error handling đầy đủ, response tiếng Việt và cronjob tách riêng là các yêu cầu bắt buộc để hệ thống chạy an toàn và nhất quán.
