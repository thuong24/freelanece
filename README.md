Các Module Hệ Thống Cốt Lõi
Hệ thống của bạn sẽ được chia thành 6 module chính:

1. Module Quản lý User & Ví (Wallet)
User Profile: một tài khoản có thể vừa đăng bài thuê, vừa đi nhận job. Quản lý điểm uy tín (Rating/Review).

Wallet System: * Lưu trữ số dư Coin (available_balance và locked_balance).

Nạp tiền (Fiat -> Coin) thông qua API cổng thanh toán.

Lịch sử biến động số dư (Transaction Logs) phải được ghi chép không thể xóa (Immutable).

2. Module Quản lý Job & Bidding (Đăng bài & Đấu giá)
Job Board: Nơi hiển thị các bài đăng. Có thuật toán sắp xếp (Ưu tiên bài đẩy Top 10k, sau đó đến bài mới nhất).

Free Quota Service: Cronjob chạy vào ngày mùng 1 hàng tháng để reset/cấp 1 lượt đăng bài miễn phí cho user.

Bidding System: Freelancer nhập giá thầu, thời gian dự kiến hoàn thành và lời nhắn.

3. Module Escrow (Ký quỹ) - Trái tim của hệ thống
Khi Client bấm "Đồng ý" thuê Freelancer, hệ thống Escrow được kích hoạt:

Hệ thống kiểm tra số dư (available_balance).

Trừ tiền ở available_balance và cộng vào locked_balance (Tiền bị giam).

Sinh ra một Contract (Hợp đồng) với trạng thái IN_PROGRESS.

4. Module Tracking & Timeline (Tiến độ)
Freelancer cập nhật tiến độ theo % hoặc theo từng mốc (Milestones).

Mỗi lần cập nhật bắt buộc kèm theo Log (Ví dụ: "Đã thiết kế xong Database", kèm link ảnh).

Client nhận được thông báo (Notification) realtime để vào kiểm tra.

5. Module Delivery & Revision (Bàn giao & Yêu cầu sửa)
Submit Work: Freelancer bấm nộp bài. Trạng thái chuyển sang WAITING_FOR_REVIEW.

Revision: Client không hài lòng, bấm "Yêu cầu sửa", đính kèm lý do. Hệ thống trả về trạng thái IN_PROGRESS.

Approval: Client bấm "Hài lòng". Hệ thống kích hoạt thanh toán: Trừ locked_balance của Client và cộng vào available_balance của Freelancer.

6. Module Dispute (Khiếu nại & Xử lý tranh chấp)
Nếu Client và Freelancer không thể thống nhất (Client ép sửa quá đáng hoặc Freelancer code không chạy), một trong hai bên có thể nhấn nút "Dispute".

Trạng thái Contract chuyển thành DISPUTED. Tiền vẫn bị giam.

Ticket được gửi đến Admin. Admin sẽ có quyền đọc log chat, xem timeline và file đính kèm để đưa ra quyết định cuối cùng (Hoàn tiền cho Client, hoặc ép thanh toán cho Freelancer).

Để hình dung rõ hơn cách hệ thống vận hành một cách mượt mà và an toàn, chúng ta hãy cùng đặt các tính năng trên vào một Ngữ cảnh sử dụng (User Journey) thực tế.

Giả sử chúng ta có hai nhân vật: Tuấn (Người thuê - Sinh viên đang cần người làm giúp đồ án web) và Nam (Người nhận - Lập trình viên đang tìm job freelance).

Giai đoạn 1: Chuẩn bị & Nạp tiền
Tuấn tạo tài khoản trên sàn. Biết rằng mình cần ngân sách khoảng 2 triệu cho đồ án này, Tuấn nạp 2.000.000 VNĐ qua cổng thanh toán VNPay. Hệ thống quy đổi và cộng vào Ví của Tuấn 2.000.000 Coin (giả sử tỷ lệ 1:1).

Giai đoạn 2: Đăng bài & Trả phí
Hôm nay là đầu tháng, hệ thống tự động cấp cho Tuấn 1 lượt đăng bài miễn phí.

Tuấn tạo bài đăng: "Cần người code website bán giày bằng ReactJS", đặt ngân sách dự kiến là 2.000.000 Coin.

Do đồ án đang gấp, Tuấn muốn nhiều người thấy bài của mình. Tuấn tích chọn tính năng "Đẩy Top". Hệ thống trừ 10.000 Coin trong ví của Tuấn. Bài đăng lập tức được ghim lên đầu bảng tin.

Giai đoạn 3: Trả giá (Bidding)
Nam dạo quanh sàn, thấy bài của Tuấn trên Top. Nam đọc yêu cầu và thấy mình có thể làm tốt, nhưng yêu cầu hơi phức tạp nên Nam quyết định trả giá cao hơn.

Nam gửi yêu cầu (Bid): "Chào bạn, mình nhận làm với giá 2.500.000 Coin, hoàn thành trong 7 ngày".

Cùng lúc đó, có một vài Coder khác cũng vào Bid với các mức giá: 1.800.000 Coin, 2.000.000 Coin.

Giai đoạn 4: Chốt Deal & Ký quỹ (Escrow)
Tuấn xem qua profile của Nam, thấy Nam uy tín (Rating cao) nên chấp nhận mức giá 2.500.000 Coin dù cao hơn ngân sách ban đầu. (Tuấn nạp thêm 500k để đủ tiền).

Tuấn bấm "Đồng ý thuê Nam".

Hệ thống Escrow lập tức kích hoạt: Trừ 2.500.000 Coin từ available_balance của Tuấn và chuyển vào trạng thái "Giam giữ" (locked_balance).

Bài đăng của Tuấn tự động bị ẩn khỏi trang chủ để không ai vào Bid nữa. Cả hai bắt đầu làm việc.

Giai đoạn 5: Tracking & Cập nhật tiến độ
Ngày 2: Nam code xong giao diện. Nam lên hệ thống cập nhật tiến độ: "Đã xong giao diện 40%" kèm theo một vài bức ảnh chụp màn hình.

Timeline trên hệ thống ghi nhận mốc này. Tuấn nhận được thông báo, vào xem ảnh, thấy yên tâm và nhắn tin phản hồi "Oke bạn, tiếp tục nhé".

Giai đoạn 6: Bàn giao & Giải ngân (Thành công)
Ngày 7: Nam code xong toàn bộ. Nam đẩy source code lên và bấm nút "Nộp bài".

Tuấn tải code về, chạy thử nghiệm nghiệm thu. Tuấn thấy có một lỗi nhỏ ở giỏ hàng nên bấm nút "Yêu cầu sửa".

Nam sửa lỗi trong 1 tiếng rồi nộp lại.

Lần này Tuấn hoàn toàn hài lòng, bấm nút "Xác nhận hoàn thành".

Hệ thống tự động nhả tiền: 2.500.000 Coin trong trạng thái giam giữ được chuyển thẳng vào Ví của Nam (có thể trừ đi một ít % phí hoa hồng của sàn nếu bạn có set up). Deal kết thúc tốt đẹp.

Trường hợp Ngoại lệ: Có biến & Tranh chấp (Dispute)
Giả sử đến ngày 7, Nam nộp bài nhưng code hoàn toàn không chạy được, hoặc Nam lặn mất tăm.

Tuấn bấm nút "Khiếu nại" (Dispute). Trạng thái hợp đồng bị đóng băng, tiền vẫn nằm ở Escrow.

Admin của sàn (chính là đội ngũ của bạn) sẽ nhận được cảnh báo. Admin vào xem Timeline (thấy Nam không hề cập nhật tiến độ), xem tin nhắn và kiểm tra code Nam nộp.

Admin phán quyết: Tuấn đúng. Admin bấm nút hoàn lại 2.500.000 Coin từ locked_balance về lại ví khả dụng của Tuấn, đồng thời ghi thẻ phạt (giảm uy tín) tài khoản của Nam.

Cập nhật Bộ quy tắc (Business Logic) cho Deadline
Bạn nên thiết lập cơ chế phạt theo phần trăm (%) hợp đồng thay vì một con số cố định, kết hợp với các quyền hạn đi kèm:

Chốt mốc thời gian (Deadline_at): Khi Client bấm "Đồng ý thuê", hệ thống sẽ cộng thời gian cam kết của Freelancer (ví dụ: 7 ngày) vào thời điểm hiện tại để sinh ra mốc deadline_at chính xác đến từng phút.

Mức phạt lũy tiến: Ví dụ, cứ trễ 24 giờ (1 ngày) thì hệ thống tự động trừ 5% giá trị hợp đồng (bạn có thể cho phép Client tự set mức % này khi đăng bài, hoặc sàn fix cứng quy định).

Tiền phạt đi về đâu? Tiền phạt sẽ được hoàn trả trực tiếp về ví của Client như một khoản đền bù thiệt hại.

Ngưỡng hủy kèo (Max Penalty Cap): Không thể phạt âm tiền được. Bạn cần đặt mức trần (Ví dụ: Trễ quá 5 ngày tương đương phạt 25%, hoặc trễ quá số ngày quy định). Quá mốc này, Client sẽ hiện nút "Hủy hợp đồng & Hoàn tiền 100%".

Quyền Gia hạn (Extension Request): Trong thực tế, có thể Freelancer bị ốm hoặc Client yêu cầu thêm tính năng nên trễ. Freelancer phải có nút "Xin gia hạn". Nếu Client bấm "Đồng ý", mốc deadline_at sẽ được dời lại và không bị phạt.

Hệ thống xử lý ngầm (Background Jobs)
Để hệ thống tự động trừ tiền, bạn không thể làm thủ công mà phải dùng Cronjob / Task Scheduler (dùng Redis BullMQ hoặc các thư viện tương tự tùy ngôn ngữ backend).

Tần suất chạy: Cứ mỗi 1 giờ hoặc 1 ngày, Cronjob sẽ quét bảng Contracts một lần.

Điều kiện lọc: Tìm các hợp đồng có status = IN_PROGRESS (đang làm) VÀ deadline_at < NOW() (đã quá hạn).

Hành động: * Tính toán số ngày trễ.

Cập nhật cột total_penalty_amount.

Bắn Notification/Email nhắc nhở cả Client và Freelancer: "Hợp đồng #123 đã trễ hạn 1 ngày. Freelancer sẽ bị trừ 5% phí..."

Để tất cả các ngữ cảnh trên (nhất là khi có Dispute) được Admin xử lý công bằng, nền tảng của bạn bắt buộc phải có tính năng Chat nội bộ
IV. Ngữ cảnh sử dụng (User Journey: Kịch bản trễ deadline)
Quay lại ví dụ của Tuấn (Người thuê) và Nam (Người nhận) với hợp đồng 2.500.000 Coin, hạn chót là 15:00 ngày 10/10. Mức phạt sàn quy định là 5%/ngày (tương đương 125.000 Coin/ngày).

15:01 Ngày 10/10: Nam vẫn chưa nộp bài.

Hệ thống quét qua, phát hiện trễ hạn. Một thông báo cảnh báo được gửi đi: "Bạn đã quá hạn, vui lòng nộp bài sớm để tránh bị trừ tiền".

15:00 Ngày 11/10 (Trễ 24h): Nam vẫn chưa nộp. Hệ thống ghi nhận mức phạt mức 1. total_penalty_amount = 125.000 Coin.

10:00 Ngày 12/10: Nam lật đật code xong và bấm "Nộp bài". Lúc này Nam đã trễ 1 ngày và chuẩn bị sang ngày thứ 2. Tổng tiền phạt chốt ở mức 125.000 Coin.

Nghiệm thu: Tuấn kiểm tra, thấy code ok và bấm "Xác nhận hoàn thành".

Hệ thống giải ngân Escrow (2.500.000 Coin bị giam) như sau:

Chuyển cho Nam: 2.500.000 - 125.000 = 2.375.000 Coin.

Hoàn trả cho Tuấn (Đền bù): 125.000 Coin.

(Cả hai giao dịch này đều được ghi nhận minh bạch vào bảng Sổ cái Transactions với loại giao dịch là LATE_PENALTY).

Ngữ cảnh 1: Khách hàng "lặn mất tăm" (The Ghost Client)
Đây là "nỗi đau" lớn nhất của Freelancer: Code xong, nộp bài rồi nhưng người thuê không chịu vào xác nhận để tiền được giải ngân.

Tình huống: Nam nộp bài đúng hạn. Nam nhắn tin nhưng Tuấn không xem. 3 ngày trôi qua, Tuấn không bấm "Hài lòng" cũng không bấm "Yêu cầu sửa".

Cách hệ thống xử lý (Auto-Release):

Hệ thống cần có một mốc thời gian chờ nghiệm thu (Grace Period), ví dụ là 72 giờ kể từ lúc Freelancer bấm "Nộp bài".

Cronjob sẽ quét: Nếu quá 72 giờ mà Client không có hành động gì, hệ thống mặc định hiểu là Client đã hài lòng.

Trạng thái hợp đồng tự động chuyển thành DONE.

Hệ thống tự động giải ngân Coin từ Escrow sang ví của Nam. Tuấn sẽ mất quyền khiếu nại (Dispute) sau thời điểm này.

Ngữ cảnh 2: Dự án lớn, nghiệm thu từng phần (Milestones)
Nếu hệ thống của bạn chỉ có 1 cục tiền giam giữ và trả 1 lần vào cuối kỳ, nó chỉ phù hợp với các job nhỏ (vài trăm ngàn đến 1-2 triệu). Với job code đồ án lớn (ví dụ 10 triệu, làm trong 1 tháng), Freelancer sẽ không chịu làm "chay" chờ đến cuối tháng mới nhận tiền.

Tình huống: Tuấn thuê Nam làm một website Fullstack giá 10.000.000 Coin. Hai bên thống nhất chia làm 3 mốc (Milestones).

Cách hệ thống xử lý (Partial Escrow):

Tuấn vẫn bị giam 10.000.000 Coin ngay từ đầu.

Mốc 1 (Code xong giao diện - 3.000.000 Coin): Nam nộp UI. Tuấn duyệt. Hệ thống trích 3.000.000 Coin từ Escrow chuyển cho Nam.

Mốc 2 (Code xong Backend - 4.000.000 Coin): Tương tự, duyệt xong nhả tiền.

Mốc 3 (Deploy & Bàn giao - 3.000.000 Coin): Hoàn thành nốt.

Nếu ở Mốc 2 xảy ra cãi vã và Dispute, Admin chỉ cần phân xử trên số tiền còn lại (7.000.000 Coin), đảm bảo công sức Mốc 1 của Nam đã được trả công xứng đáng.

Ngữ cảnh 3: "Chia tay trong êm đẹp" (Mutual Cancellation)
Không phải lúc nào hủy hợp đồng cũng là do lừa đảo hay cãi vã. Đôi khi là do bất khả kháng.

Tình huống: Nam nhận job xong, đọc kỹ lại tài liệu mới thấy yêu cầu dùng một thư viện quá cũ mà Nam chưa từng làm. Mới qua 1 ngày, Nam chủ động nhắn Tuấn: "Bạn ơi phần này mình không kham nổi, bạn tìm người khác giúp mình nhé, xin lỗi bạn". Tuấn cũng thông cảm.

Cách hệ thống xử lý:

Hệ thống có một nút "Xin hủy hợp đồng" dành cho cả 2 bên.

Nam bấm "Xin hủy", đính kèm lý do. Tuấn nhận được thông báo và bấm "Đồng ý".

Ngay lập tức, 100% tiền trong Escrow được trả lại ví khả dụng của Tuấn.

Vì hai bên đồng thuận, không ai bị hệ thống trừ điểm uy tín (hoặc trừ rất nhẹ), và không cần Admin phải can thiệp phân xử.

Ngữ cảnh 4: Yêu cầu phình to (Scope Creep) - "Sẵn tiện làm thêm cho anh cái này..."
Đây là "căn bệnh" phổ biến nhất khi làm freelance.

Tình huống: Ban đầu Tuấn chỉ thuê Nam làm một web hiển thị danh sách phòng trọ đơn giản bằng Next.js. Đang làm giữa chừng, Tuấn bảo: "Em ơi, sẵn tiện code thêm cho anh cái thuật toán tìm kiếm thông minh và so sánh bất động sản nhé, chắc nhanh mà". Nam tá hỏa vì phần này tốn cả tuần để làm, nhưng sợ từ chối thì Tuấn giận, đánh giá 1 sao hoặc Dispute.

Cách hệ thống giải quyết (Nút Thưởng/Tips & Hợp đồng phụ):

Hệ thống không cho phép sửa ngân sách của hợp đồng gốc đang chạy.

Tuy nhiên, nền tảng cung cấp tính năng "Tạo hợp đồng bổ sung" (Add-on/Milestone phụ) hoặc nút "Thưởng thêm" (Add Bonus).

Nam có thể từ chối khéo: "Phần này nằm ngoài mô tả ban đầu, anh tạo thêm một mốc thanh toán 500k Coin nữa nhé, em nhận thì em làm tiếp".

Sự minh bạch này giúp loại bỏ "nút thắt cổ chai" trong quá trình làm việc, tránh việc một bên ôm cục tức.

Ngữ cảnh 5: "Treo đầu dê bán thịt chó" - Lấy code clone/mã nguồn mở đi nộp
Khác với thiết kế ảnh, code rất dễ copy. Đặc biệt với đối tượng thuê làm báo cáo khóa luận tốt nghiệp (BKLTTN), việc trùng lặp code là cực kỳ nguy hiểm.

Tình huống: Tuấn thuê Nam code một hệ thống quản lý. Nam lên Github tải một source code có sẵn, đổi mỗi logo rồi nộp. Tuấn là người không rành kỹ thuật nên bấm "Xác nhận hài lòng", tiền đã chuyển cho Nam. Tuần sau Tuấn đem nộp thầy giáo thì bị phát hiện đạo văn, rớt môn. Tuấn quay lại sàn đòi kiện.

Cách hệ thống giải quyết (Chính sách Bảo hành - Warranty Period):

Mặc dù tiền đã nhả từ locked_balance sang available_balance của Nam, nhưng hệ thống thiết lập tính năng Hold (Tạm giữ rút tiền) trong 3 - 5 ngày đối với dòng tiền vừa nhận.

Trong thời gian này, Nam có Coin trong ví nhưng chưa thể đổi ra VNĐ rút về ngân hàng.

Nếu Tuấn có bằng chứng xác đáng bị lừa đảo/trùng code, Admin vẫn có quyền phong tỏa tài khoản của Nam và thu hồi số tiền đó trả lại cho Tuấn.

Ngữ cảnh 6: "Lôi nhau ra Zalo" (Bypass Platform)
Mọi sàn giao dịch (Upwork, Fiverr, Shopee) đều đau đầu với việc người dùng lén cho nhau số điện thoại để giao dịch bên ngoài, né phí hệ thống.

Tình huống: Nam và Tuấn chat với nhau trên sàn. Tuấn bảo: "Sàn thu phí 10k đắt quá lại còn giam tiền, add Zalo 09xx.xxx.xxx làm việc cho nhanh, anh chuyển khoản trước 50%".

Cách hệ thống giải quyết (Auto-Censor & Warning):

Bạn cần cài một bộ lọc (Regex Filter) vào hệ thống Chat. Khi phát hiện các cụm từ như "zalo, sđt, ck, chuyển khoản, bank" hoặc chuỗi số giống số điện thoại, hệ thống sẽ che lại ()* hoặc hiển thị cảnh báo đỏ ngay trong khung chat: "Giao dịch ngoài hệ thống sẽ không được bảo vệ bởi Escrow. Bạn có nguy cơ mất trắng tiền."

Nếu tài khoản nào vi phạm gửi số điện thoại nhiều lần, hệ thống tự động khóa tính năng Bid/Đăng bài trong 24h.

Ngữ cảnh 7: "Giam Code tống tiền" (The Hostage Situation)
Nhiều Freelancer có tâm lý sợ bị Client lừa, nên họ nảy ra trò "cầm đằng chuôi".

Tình huống: Nam code xong, quay một đoạn video gửi Tuấn xem chứng minh phần mềm đã chạy. Tuy nhiên, Nam không chịu nộp file code lên hệ thống mà nhắn: "Anh gửi video demo rồi đó, em vào bấm 'Xác nhận hoàn thành' để hệ thống nhả tiền đi, rồi anh gửi file code qua cho". Hoặc tệ hơn: "Nạp thêm cho anh 200k Momo anh mới giao code".

Cách hệ thống giải quyết (Strict Delivery Policy):

Hệ thống quy định rõ: Chỉ có file/link đính kèm ở nút "Nộp Bài" trên sàn mới có giá trị pháp lý.

Admin khi phân xử Dispute thấy tin nhắn ép giải ngân trước, tự động xử Freelancer thua, khóa tài khoản và hoàn tiền cho Client. Tuyệt đối không có ngoại lệ.

Ngữ cảnh 8: Lỗi kinh điển "Trên máy em vẫn chạy bình thường"
Code không giống file Word hay Photoshop tải về là mở được. Rất nhiều Client là sinh viên mất căn bản, không biết cách chạy môi trường.

Tình huống: Nam nộp code. Tuấn tải về nhưng máy Tuấn thiếu thư viện, cài sai version Node.js, không biết import Database... nên chạy lên lỗi đỏ lòm. Tuấn tức giận cho rằng Nam giao code "rác", lừa đảo và bấm Dispute. Cả hai cãi nhau nảy lửa.

Cách hệ thống giải quyết (Readme Rule & Remote Setup):

Bắt buộc có file hướng dẫn: Form "Nộp bài" bắt buộc Freelancer phải tick vào ô "Tôi cam kết đã có file README.md hướng dẫn cài đặt từng bước".

Bán kèm dịch vụ (Upsell): Khi đăng Job hoặc khi Bid, hệ thống cho phép thêm tùy chọn "Hỗ trợ cài đặt qua Ultraviewer/Teamviewer" (Giá 50k - 100k, hoặc Free tùy Freelancer). Nếu Client mua gói này, Freelancer phải cài tận máy cho Client, giải quyết triệt để cớ "máy tôi lỗi".

Ngữ cảnh 9: Nhận Job xong "Bốc hơi" (The MIA Freelancer)
Giam tiền là để đảm bảo, nhưng giam cả thời gian của Client thì rất nguy hiểm.

Tình huống: Hạn chót là 10 ngày. Tuấn đã bị giam 2 triệu. Nhưng đến ngày thứ 5, Nam không cập nhật một dòng tiến độ nào, Tuấn nhắn tin hỏi thăm cũng không xem, không trả lời. Tuấn hoảng sợ vì sắp đến ngày báo cáo thầy giáo, muốn hủy kèo đi tìm người khác nhưng hệ thống bắt phải đợi đến ngày thứ 10 mới cho hủy (vì chưa tới deadline).

Cách hệ thống giải quyết (Tính năng "Báo động đỏ" - Ping):

Nếu sau 48 giờ kể từ lúc nhận job mà Freelancer không có tương tác nào (không rep tin nhắn, không cập nhật Timeline), hệ thống hiện nút "Báo động (Ping)" cho Client.

Khi bấm Ping, hệ thống gửi SMS/Email khẩn cấp cho Freelancer.

Nếu 24 giờ sau cú Ping mà Freelancer vẫn "im thin thít", Client được quyền đơn phương hủy hợp đồng lập tức, rút tiền về hoàn toàn mà không bị phạt. Freelancer sẽ bị khóa móm hoặc trừ rating nặng.

Ngữ cảnh 10: Tranh chấp về "Chất lượng Code" vs "Tính năng"
Đây là đặc thù riêng của ngách "Code thuê/Làm bài tập", khác với việc code ra sản phẩm thương mại. Sinh viên đem code đi nộp thầy giáo cần sự gọn gàng để dễ bề giải thích.

Tình huống: Yêu cầu là web bán hàng. Nam code xong, app chạy mượt mà, mua hàng ngon lành. Tuy nhiên, Nam dồn tất cả logic vào chung 1 file HTML duy nhất, đặt tên biến là a, b, c lộn xộn. Tuấn đem nộp, thầy giáo soi source code và cho 0 điểm vì vi phạm nguyên tắc clean code. Tuấn quay lại đòi tiền, Nam cãi: "Tôi làm app chạy được đúng ý rồi còn gì?".

Cách hệ thống giải quyết (Checklist Phân loại Yêu cầu):

Ở bước Client đăng bài, thay vì chỉ có một ô Text description, hệ thống bắt buộc Client tick chọn Tiêu chuẩn Code:

[ ] Chỉ cần app chạy được, không quan trọng source code.

[ ] Cần code chuẩn Clean Code, chia cấu trúc thư mục (MVC...).

[ ] Bắt buộc có Comment giải thích code chi tiết từng hàm.

Khi có Dispute, Admin căn cứ vào Checkbox này. Nếu Client không tick ngay từ đầu, Nam thắng (vì app chạy được). Nếu Client đã tick mà Nam code ẩu, Nam buộc phải refactor (sửa lại code) hoặc bị trừ 50% tiền đền bù.

Ngữ cảnh 11: Ăn cắp chất xám (The "Refund & Run" Fraud)
Đây là chiêu trò lừa đảo từ phía người đi thuê (Client), rất phổ biến trong mảng thiết kế và code.

Tình huống: Nam code xong 100% và giao Source Code. Tuấn tải về máy lưu lại. Sau đó, Tuấn cố tình tìm một vài lỗi nhỏ xíu, hoặc tự ý xóa 1 dòng code cho app sập, rồi bấm Dispute la làng là: "Code hỏng, không xài được, yêu cầu hoàn tiền 100%". Nếu Admin dễ dãi xử Tuấn thắng, Tuấn vừa lấy lại được tiền, vừa có code mang đi sửa nhẹ lại để dùng. Nam mất trắng công sức.

Cách hệ thống giải quyết (Cơ chế Demo/Staging Environment):

Sàn quy định: Ở bước nộp bài, Freelancer chỉ nộp Link Demo (Website đã deploy) hoặc Video quay màn hình để Client test nghiệm thu các tính năng, chưa giao Source Code.

Khi Client test trên Demo thấy OK và bấm "Xác nhận nghiệm thu Demo", lúc này hệ thống mới cho phép Freelancer tải Source Code (file .zip) lên.

Khi Source Code được tải lên, hệ thống tự động giải ngân (Release Escrow). Client không còn quyền vin vào cớ "code không chạy" để đòi hoàn 100% tiền nữa.

Ngữ cảnh 12: Đứt gánh giữa đường (Partial Surrender)
Không phải lúc nào Dispute cũng là do cãi nhau, có khi là do Freelancer thực sự "lực bất tòng tâm" nhưng đã làm được một nửa.

Tình huống: Nam làm đồ án cho Tuấn. Giao diện (Frontend) làm xong rất đẹp, nhưng phần Backend kết nối AI quá khó, Nam làm 5 ngày không ra. Ngày mai Tuấn phải nộp bài. Nam chủ động xin lỗi. Tuấn rất gấp, muốn lấy phần Frontend đó đưa cho người khác làm tiếp Backend, Nam cũng muốn vớt vát chút tiền công 5 ngày qua. Nếu hệ thống chỉ có nút "Hủy hợp đồng" (Tuấn lấy lại 100% tiền, Nam mất trắng) thì Nam sẽ không chịu giao Frontend.

Cách hệ thống giải quyết (Thương lượng tỷ lệ đền bù - Partial Settlement):

Khi bấm nút Dispute, hệ thống cung cấp một thanh trượt (Slider) để hai bên tự thương lượng tỷ lệ chia tiền trong Escrow mà không cần Admin can thiệp.

Nam đề xuất: "Tôi lấy 30%, bạn nhận lại 70%".

Nếu Tuấn bấm "Đồng ý", hệ thống lập tức chia tiền 3-7, hợp đồng đóng lại. Tuấn có quyền tải phần code dở dang về. Cơ chế này giảm tải tới 80% khối lượng công việc cho Admin của sàn.

Ngữ cảnh 13: Thảm họa "Spam Thầu" (The Auto-bot Bidders)
Khi sàn của bạn có chút tiếng tăm, các đội ngũ "cày" job sẽ dùng tool auto.

Tình huống: Tuấn vừa đăng bài "Cần người làm web React". Chưa đầy 1 giây sau, có ngay 10 lời chào giá (Bid) với nội dung y hệt nhau: "Chào anh, em có 5 năm kinh nghiệm, đảm bảo giá rẻ...". Tuấn bị ngợp, trong khi những người làm thật sự thì bị đẩy xuống dưới.

Cách hệ thống giải quyết (Anti-Spam & Custom Question):

Giới hạn lượt Bid: Mỗi tháng Freelancer chỉ được tặng 10 lượt Bid miễn phí. Muốn Bid tiếp phải dùng Coin để mua (VD: 2.000 Coin/lượt). Việc này ép họ phải đọc kỹ job chứ không rải rác bừa bãi.

Câu hỏi ẩn (Screening Question): Cho phép Client thêm 1 câu hỏi bắt buộc khi đăng job. VD: "Bạn định dùng thư viện nào cho phần Chart?". Freelancer dùng bot auto sẽ không thể trả lời câu này, hoặc trả lời sai. Client chỉ cần nhìn câu trả lời là biết ai đọc kỹ yêu cầu.

Ngữ cảnh 14: Kẻ bán thầu (The Middleman/Broker)
Đây là trường hợp một người nhận job nhưng không trực tiếp làm mà quăng cho người khác làm với giá rẻ hơn để ăn chênh lệch.

Tình huống: Nam nhận job của Tuấn giá 3 triệu. Sau đó Nam bê nguyên yêu cầu này, sang một Group Facebook hoặc thậm chí đăng lại lên chính sàn của bạn với giá 1.5 triệu để thuê một bạn sinh viên năm nhất làm. Sự cố xảy ra khi bạn sinh viên kia code lỗi, Nam ở giữa không biết sửa, còn Tuấn hỏi tiến độ thì Nam trả lời rất chậm (vì phải đợi bạn sinh viên kia rep).

Cách hệ thống giải quyết (Phân tích hành vi & Đánh giá chéo):

Về mặt công nghệ rất khó để cấm người ta outsource ra ngoài. Tuy nhiên, sàn giải quyết bằng Hệ thống Rating chi tiết.

Sau khi hoàn thành job, thay vì chỉ vote 1-5 sao chung chung, hệ thống yêu cầu Client đánh giá 3 tiêu chí: Chất lượng code / Tốc độ phản hồi / Sự am hiểu kỹ thuật (Communication).

Những kẻ bán thầu thường có điểm "Tốc độ phản hồi" và "Am hiểu kỹ thuật" rất thấp (vì họ chỉ là trung gian truyền đạt). Khách hàng sau nhìn vào profile thấy điểm này thấp sẽ tự động né.

Một tính năng "Killer" bổ sung thêm để bạn cân nhắc:

Với tệp khách hàng là Sinh viên nhờ làm đồ án/bài tập, họ có một nỗi sợ rất lớn: Không biết giải thích code với giáo viên.

Bạn có thể thiết kế một tính năng/dịch vụ gọi là "Bàn giao kèm giải thích" (Code Walkthrough). Khi Freelancer nộp bài, hệ thống tạo ra một phòng họp ảo (hoặc yêu cầu đính kèm link video record) ghi lại cảnh Freelancer chạy thử code và giải thích luồng hoạt động của các file chính. Sàn có thể thu thêm phí % trên dịch vụ đặc biệt này. Khách hàng là sinh viên cực kỳ sẵn sàng trả thêm tiền để có video này học thuộc trước khi lên bảo vệ.
Để biến toàn bộ 14 ngữ cảnh trên thành hiện thực, chúng ta cần thiết kế một API Flow (Luồng API) chuẩn RESTful. Trọng tâm của hệ thống này là đảm bảo tính toàn vẹn dữ liệu (Data Integrity) khi dòng tiền di chuyển, đồng thời xử lý các tác vụ bất đồng bộ (Background Jobs).

Dưới đây là cấu trúc API Backend được chia thành 7 luồng chính để bạn dễ dàng giao việc cho team hoặc tự code:

Flow 1: Quản lý Ví & Dòng tiền (Wallet & Transactions)
Đây là module nhạy cảm nhất, bắt buộc phải dùng Database Transaction (nếu 1 bước lỗi, rollback toàn bộ).

POST /api/wallet/deposit: Nạp tiền (Webhook từ VNPay/MoMo).

Logic: Cộng available_balance cho User -> Ghi log vào bảng Transactions (Type: DEPOSIT).

POST /api/wallet/withdraw: Rút tiền.

Logic: Trừ available_balance -> Ghi log (Type: WITHDRAW) -> Bắn request sang API Ngân hàng. Kèm check thời gian Hold (Ngữ cảnh 5: Tiền vừa nhận phải hold 3-5 ngày mới cho rút).

Flow 2: Đăng bài & Bidding (Jobs & Bids)
POST /api/jobs: Khách hàng đăng bài.

Payload: Title, Description, Budget, Deadline_Days, Require_CleanCode (Ngữ cảnh 10), Is_Bumped (Đẩy top).

Logic: Check User có free_quota không? -> Không có thì trừ available_balance 10k -> Nếu đẩy top thì trừ thêm 10k -> Tạo Job.

GET /api/jobs: Lấy danh sách Job (Có thuật toán sort đưa bài Bumped lên đầu).

POST /api/jobs/{job_id}/bids: Freelancer chào giá.

Logic: Check lượt Bid miễn phí của Freelancer (Ngữ cảnh 13: Chống Spam Tool) -> Tạo Bid -> Bắn Notification cho Client.

Flow 3: Chốt Deal & Ký Quỹ (Escrow Core) - Cực kỳ quan trọng
Khi Client bấm "Đồng ý thuê".

POST /api/contracts/accept-bid

Logic (Bọc trong DB Transaction):

Kiểm tra số dư available_balance của Client.

Trừ available_balance và cộng vào locked_balance (Giam tiền).

Tạo record trong bảng Contracts (Status: IN_PROGRESS).

Tính toán deadline_at = Thời gian hiện tại + Số ngày Freelancer cam kết.

Đổi status Job thành ASSIGNED (Ẩn khỏi bảng tin).

Ghi log Transaction (Type: ESCROW_LOCK).

Flow 4: Làm việc & Quản lý Scope (Tracking & Scope Creep)
POST /api/contracts/{id}/timelines: Freelancer cập nhật tiến độ.

Logic: Lưu text/ảnh vào bảng Timelines -> Reset lại bộ đếm thời gian Inactive (Ngữ cảnh 9: MIA Freelancer).

POST /api/contracts/{id}/addons: Thêm yêu cầu phát sinh (Ngữ cảnh 4).

Logic: Client tạo mốc phụ -> Thanh toán Escrow cho khoản phụ này -> Gắn vào Contract hiện tại.

POST /api/contracts/{id}/mutual-cancel: Xin hủy hợp đồng êm đẹp (Ngữ cảnh 3).

Logic: Freelancer request -> Client đồng ý -> Trả 100% locked_balance về available_balance của Client -> Đóng Contract.

Flow 5: Bàn Giao & Nghiệm Thu (Delivery & Acceptance)
Tránh tình trạng "Giam code tống tiền" hoặc "Refund & Run".

POST /api/contracts/{id}/submit-demo: Nộp link Demo (Ngữ cảnh 11).

Logic: Freelancer nộp link chạy thử -> Status Contract: WAITING_DEMO_APPROVAL.

POST /api/contracts/{id}/approve-demo: Client duyệt Demo.

Logic: Status -> WAITING_SOURCE_CODE. Kích hoạt nút upload Source Code cho Freelancer.

POST /api/contracts/{id}/submit-final: Freelancer nộp Source Code (Bắt buộc kèm link Google Drive Public + Checkbox đã có file Readme - Ngữ cảnh 8).

Logic: Đổi Status -> WAITING_FOR_REVIEW. Set mốc thời gian submitted_at để tính Auto-release.

POST /api/contracts/{id}/accept: Client hài lòng.

Logic (DB Transaction): Trừ locked_balance (Client) -> Cộng available_balance (Freelancer) -> Trừ phần trăm phí sàn (nếu có) -> Ghi log. Status -> DONE.

Flow 6: Tranh chấp & Phân xử (Disputes)
POST /api/contracts/{id}/dispute: Client hoặc Freelancer bấm khiếu nại.

Logic: Đổi Status -> DISPUTED. Đóng băng mọi thao tác đếm ngược thời gian. Bắn alert cho Admin.

POST /api/admin/disputes/{contract_id}/resolve: Quyết định của Admin hoặc 2 bên tự thương lượng (Ngữ cảnh 12).

Payload: client_refund_amount, freelancer_receive_amount.

Logic: Giải ngân từ cục locked_balance theo tỷ lệ phân xử -> Cập nhật Rating/Phạt tài khoản vi phạm -> Đóng Contract.

Flow 7: Background Workers (Cronjobs) - "Linh hồn" tự động hóa
Phần này không phải là API gọi từ phía người dùng, mà là các script chạy ngầm trên Server (dùng Redis BullMQ hoặc node-cron).

Late Penalty Cron (Chạy mỗi 1 giờ):

Quét các Contract IN_PROGRESS có deadline_at < NOW().

Tính toán % phạt -> Update cột total_penalty -> Bắn cảnh báo.

Auto-Release Cron (Chạy mỗi 30 phút):

Quét các Contract WAITING_FOR_REVIEW (Client lặn mất tăm - Ngữ cảnh 1).

Nếu NOW() - submitted_at > 72 hours -> Tự động gọi hàm logic Accept ở Flow 5 để trả tiền cho Freelancer.

MIA Tracker Cron (Chạy mỗi 12 giờ):

Quét Freelancer không cập nhật gì sau 48h -> Hiện nút PING cho Client (Ngữ cảnh 9).

Monthly Reset Cron (Chạy 00:00 ngày 1 hàng tháng):

Reset free_post_count và free_bid_count của toàn bộ User về lại mức tiêu chuẩn.

Với cấu trúc luồng xử lý này, hệ thống Backend của bạn đã bao phủ gần như toàn bộ vòng đời của một dự án Freelance từ lúc bắt đầu đến lúc kết thúc (thành công hoặc đổ vỡ).