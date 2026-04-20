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
