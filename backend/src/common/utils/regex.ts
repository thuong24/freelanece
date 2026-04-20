// Regex phát hiện bypass platform (chia sẻ thông tin liên lạc ngoài hệ thống)
// Dùng cho bộ lọc chat nội bộ chống anti-bypass

// Phát hiện số điện thoại Việt Nam (các đầu số phổ biến)
export const PHONE_REGEX =
  /(?:0|\+84)(?:3[2-9]|5[25689]|7[06-9]|8[0-9]|9[0-9])\d{7}/g;

// Phát hiện các từ khóa liên lạc bên ngoài
export const BYPASS_KEYWORDS_REGEX =
  /\b(?:zalo|telegram|facebook|fb|instagram|ig|tiktok|skype|discord|whatsapp|line|viber|wechat)\b/gi;

// Phát hiện chuyển khoản ngân hàng
export const BANK_KEYWORDS_REGEX =
  /\b(?:ck|chuyển khoản|chuyenkhoan|banking|vietcombank|vcb|techcombank|tcb|bidv|agribank|tpbank|mbbank|acb|sacombank|vpbank|momo|zalopay|vnpay|paypal)\b/gi;

// Phát hiện email
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Kiểm tra tin nhắn có chứa nội dung vi phạm không
export const containsRestrictedKeywords = (content: string): boolean => {
  // Reset lastIndex cho global regexes
  [PHONE_REGEX, BYPASS_KEYWORDS_REGEX, BANK_KEYWORDS_REGEX, EMAIL_REGEX].forEach(
    (r) => (r.lastIndex = 0)
  );

  const normalized = content.toLowerCase();
  return (
    PHONE_REGEX.test(content) ||
    BYPASS_KEYWORDS_REGEX.test(normalized) ||
    BANK_KEYWORDS_REGEX.test(normalized) ||
    EMAIL_REGEX.test(content)
  );
};

// Che nội dung vi phạm (thay thế bằng ***)
export const censorContent = (content: string): string => {
  // Reset lastIndex của global regex sau mỗi lần dùng
  [PHONE_REGEX, BYPASS_KEYWORDS_REGEX, BANK_KEYWORDS_REGEX, EMAIL_REGEX].forEach(
    (r) => (r.lastIndex = 0)
  );

  return content
    .replace(PHONE_REGEX, "***SĐT***")
    .replace(BYPASS_KEYWORDS_REGEX, "***")
    .replace(BANK_KEYWORDS_REGEX, "***")
    .replace(EMAIL_REGEX, "***EMAIL***");
};
