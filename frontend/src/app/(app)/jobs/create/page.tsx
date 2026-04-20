"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateJobSchema, type CreateJobInput } from "@/lib/validations/job.schema";
import { useCreateJob } from "@/lib/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  const { mutate: createJob, isPending } = useCreateJob();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateJobInput>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: { codeQualityRequirement: "FUNCTIONAL_ONLY" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Đăng việc mới</h1>
          <p className="text-slate-400 text-sm">Mô tả dự án để thu hút freelancer phù hợp</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit((d) => createJob(d))} className="space-y-6">
          <Input
            label="Tiêu đề dự án *"
            placeholder="VD: Cần code backend Node.js cho app bán hàng..."
            error={errors.title?.message}
            {...register("title")}
          />

          <Textarea
            label="Mô tả chi tiết *"
            placeholder="Mô tả yêu cầu, kỹ năng cần thiết, sản phẩm bàn giao..."
            rows={6}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngân sách (VNĐ) *"
              type="number"
              placeholder="5,000,000"
              error={errors.budget?.message}
              {...register("budget", { valueAsNumber: true })}
            />
            <Input
              label="Deadline (ngày) *"
              type="number"
              placeholder="14"
              hint="Số ngày để hoàn thành"
              error={errors.deadlineDays?.message}
              {...register("deadlineDays", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Yêu cầu chất lượng code</label>
            <select
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("codeQualityRequirement")}
            >
              <option value="FUNCTIONAL_ONLY">Chỉ cần chạy được</option>
              <option value="CLEAN_CODE">Clean code</option>
              <option value="CLEAN_CODE_WITH_COMMENTS">Clean code + comment giải thích</option>
            </select>
          </div>

          <Input
            label="Câu hỏi sàng lọc (tuỳ chọn)"
            placeholder="VD: Bạn đã từng làm với MySQL chưa?"
            hint="Freelancer phải trả lời khi bid"
            error={errors.screeningQuestion?.message}
            {...register("screeningQuestion")}
          />

          <div className="flex gap-3 pt-2">
            <Link href="/jobs" className="flex-1">
              <Button variant="secondary" fullWidth type="button">Huỷ</Button>
            </Link>
            <Button fullWidth type="submit" loading={isPending}>
              Đăng bài
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
