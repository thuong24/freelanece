"use client";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Alert } from "@/lib/utils/alert";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PageSpinner } from "@/components/ui/Spinner";
import { Camera } from "lucide-react";

const getFullUrl = (url: string | undefined | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
};

export default function SettingsProfilePage() {
  const { user, setAuth } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: async () => { const r = await usersApi.getMe(); return r.data.data; },
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      name: profile?.name ?? "",
      bio: profile?.bio ?? "",
      skills: Array.isArray(profile?.skills) ? profile.skills.join(", ") : "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Alert.error("Chỉ chấp nhận file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Alert.error("Kích thước file tối đa là 5MB");
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const update = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.bio) formData.append("bio", data.bio);
      
      const skillsArray = data.skills ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
      if (skillsArray.length > 0) {
        formData.append("skills", JSON.stringify(skillsArray));
      }

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formData.append("avatar", file);
      }

      return usersApi.updateMe(formData);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
      if (user) setAuth(res.data.data as any, useAuthStore.getState().accessToken!);
      Alert.toast("Cập nhật hồ sơ thành công!", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Cập nhật thất bại"),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Hồ sơ cá nhân</h1>
        <p className="text-slate-400 text-sm mt-0.5">Cập nhật thông tin hiển thị công khai</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar 
              name={profile?.name || "?"} 
              src={avatarPreview || getFullUrl(profile?.avatarUrl)} 
              size="lg" 
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <div>
            <p className="text-slate-200 font-semibold">{profile?.name}</p>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              {"⭐".repeat(Math.round(profile?.ratingAvg ?? 0))}
              <span className="text-slate-400 text-xs ml-1">({profile?.ratingCount} đánh giá)</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-5">
          <Input label="Họ và tên" {...register("name")} />
          <Textarea label="Giới thiệu bản thân" rows={3} placeholder="Mô tả kỹ năng và kinh nghiệm..." {...register("bio")} />
          <Input
            label="Kỹ năng"
            placeholder="React, Node.js, PostgreSQL, ..."
            hint="Phân cách bằng dấu phẩy"
            {...register("skills")}
          />
          <Button type="submit" fullWidth disabled={!isDirty && !avatarPreview} loading={update.isPending}>
            Lưu thay đổi
          </Button>
        </form>
      </Card>
    </div>
  );
}
