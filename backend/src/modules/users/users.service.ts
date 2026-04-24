import { NotFoundError } from "../../common/errors/http-errors";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as usersRepo from "./users.repository";
import type { UpdateProfileDto, GetReviewsQueryDto } from "./users.dto";

// Lấy thông tin cá nhân của user đang đăng nhập
export const getMe = async (userId: string) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) throw new NotFoundError("Không tìm thấy tài khoản");

  // Parse skills từ JSON string
  return {
    ...user,
    skills: user.skills ? JSON.parse(user.skills) : [],
  };
};

// Cập nhật thông tin cá nhân
export const updateMe = async (userId: string, dto: UpdateProfileDto) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) throw new NotFoundError("Không tìm thấy tài khoản");

  // Nếu cập nhật avatar mới và user đã có avatar cũ là file local
  if (dto.avatarUrl && user.avatarUrl && user.avatarUrl.startsWith("/uploads/")) {
    const fs = require("fs");
    const path = require("path");
    const oldFilePath = path.join(process.cwd(), user.avatarUrl);
    if (fs.existsSync(oldFilePath)) {
      try {
        fs.unlinkSync(oldFilePath);
      } catch (err) {
        console.error("Không thể xóa file avatar cũ:", err);
      }
    }
  }

  const updated = await usersRepo.updateUserProfile(userId, dto);

  return {
    ...updated,
    skills: updated.skills ? JSON.parse(updated.skills) : [],
  };
};

// Lấy public profile của một user khác
export const getPublicProfile = async (userId: string) => {
  const user = await usersRepo.findPublicProfileById(userId);
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  if (user.status === "BANNED") {
    throw new NotFoundError("Người dùng này không còn tồn tại trên hệ thống");
  }

  return {
    ...user,
    skills: user.skills ? JSON.parse(user.skills) : [],
  };
};

// Lấy danh sách đánh giá của một user
export const getUserReviews = async (userId: string, query: GetReviewsQueryDto) => {
  // Kiểm tra user tồn tại
  const user = await usersRepo.findPublicProfileById(userId);
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  const params = getPaginationParams(query);
  const [reviews, total] = await Promise.all([
    usersRepo.findUserReviews(userId, params.skip, params.limit),
    usersRepo.countUserReviews(userId),
  ]);

  return { reviews, meta: buildPaginationMeta(total, params) };
};
