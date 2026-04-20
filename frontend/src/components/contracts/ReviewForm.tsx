"use client";
import { useForm } from "react-hook-form";
import { useCreateReview } from "@/lib/hooks/useTimelines";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps { contractId: string; partnerName: string; }

export const ReviewForm = ({ contractId, partnerName }: ReviewFormProps) => {
  const { mutate: createReview, isPending } = useCreateReview();
  const [scores, setScores] = useState({ codeQualityScore: 5, communicationScore: 5, speedScore: 5 });
  const { register, handleSubmit } = useForm();

  const StarRating = ({ field, label }: { field: keyof typeof scores; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setScores((s) => ({ ...s, [field]: n }))}>
            <Star className={`w-5 h-5 transition-colors ${n <= scores[field] ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const onSubmit = (data: any) => {
    createReview({ contractId, ...scores, comment: data.comment });
  };

  return (
    <Card>
      <h3 className="font-semibold text-slate-100 mb-4">⭐ Đánh giá {partnerName}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3 bg-slate-800/50 rounded-xl p-4">
          <StarRating field="codeQualityScore" label="Chất lượng code" />
          <StarRating field="communicationScore" label="Giao tiếp" />
          <StarRating field="speedScore" label="Tốc độ" />
        </div>
        <Textarea label="Nhận xét (tuỳ chọn)" placeholder="Chia sẻ trải nghiệm làm việc của bạn..." rows={3} {...register("comment")} />
        <Button type="submit" loading={isPending} fullWidth>Gửi đánh giá</Button>
      </form>
    </Card>
  );
};
