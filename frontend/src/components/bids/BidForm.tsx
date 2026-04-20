"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBidSchema, type CreateBidInput } from "@/lib/validations/bid.schema";
import { useCreateBid } from "@/lib/hooks/useBids";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface BidFormProps {
  jobId: string;
  screeningQuestion?: string | null;
  open: boolean;
  onClose: () => void;
}

export const BidForm = ({ jobId, screeningQuestion, open, onClose }: BidFormProps) => {
  const { mutate: createBid, isPending } = useCreateBid(jobId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBidInput>({
    resolver: zodResolver(CreateBidSchema),
  });

  const onSubmit = (data: CreateBidInput) => {
    createBid(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Đặt giá thầu" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá thầu (VNĐ) *"
            type="number"
            placeholder="3,000,000"
            error={errors.bidAmount?.message}
            {...register("bidAmount", { valueAsNumber: true })}
          />
          <Input
            label="Thời gian (ngày) *"
            type="number"
            placeholder="10"
            error={errors.estimatedDays?.message}
            {...register("estimatedDays", { valueAsNumber: true })}
          />
        </div>

        <Textarea
          label="Lời giới thiệu *"
          placeholder="Giới thiệu kinh nghiệm, phương án thực hiện..."
          rows={4}
          error={errors.message?.message}
          {...register("message")}
        />

        {screeningQuestion && (
          <Textarea
            label={`Câu hỏi sàng lọc: ${screeningQuestion}`}
            placeholder="Câu trả lời của bạn..."
            rows={3}
            error={errors.screeningAnswer?.message}
            {...register("screeningAnswer")}
          />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Huỷ</Button>
          <Button type="submit" fullWidth loading={isPending}>Gửi Bid</Button>
        </div>
      </form>
    </Modal>
  );
};
