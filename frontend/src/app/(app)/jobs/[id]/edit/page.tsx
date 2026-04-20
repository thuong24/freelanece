"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateJobSchema, type CreateJobInput } from "@/lib/validations/job.schema";
import { useJob, useUpdateJob } from "@/lib/hooks/useJobs";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: job, isLoading } = useJob(id);
  const { mutate: updateJob, isPending } = useUpdateJob(id);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<CreateJobInput>({
    resolver: zodResolver(CreateJobSchema),
  });

  useEffect(() => {
    if (job) {
      if (job.clientId !== user?.id) {
        router.replace(`/jobs/${id}`);
      } else {
        reset({
          title: job.title,
          description: job.description,
          budget: parseFloat(job.budget),
          deadlineDays: job.deadlineDays,
          codeQualityRequirement: job.codeQualityRequirement as any,
          screeningQuestion: job.screeningQuestion || undefined,
        });
      }
    }
  }, [job, user, reset, router, id]);

  if (isLoading) return <PageSpinner />;
  if (!job || job.clientId !== user?.id) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Chỉnh sửa công việc</h1>
          <p className="text-slate-400 text-sm">Cập nhật thông tin dự án</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit((d) => updateJob(d))} className="space-y-6">
          <Input
            label="Tiêu đề dự án *"
            error={errors.title?.message}
            {...register("title")}
          />

          <Textarea
            label="Mô tả chi tiết *"
            rows={6}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngân sách (VNĐ) *"
              type="number"
              error={errors.budget?.message}
              {...register("budget", { valueAsNumber: true })}
            />
            <Input
              label="Deadline (ngày) *"
              type="number"
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
            error={errors.screeningQuestion?.message}
            {...register("screeningQuestion")}
          />

          <div className="flex gap-3 pt-2">
            <Link href={`/jobs/${id}`} className="flex-1">
              <Button variant="secondary" fullWidth type="button">Huỷ</Button>
            </Link>
            <Button fullWidth type="submit" loading={isPending} disabled={!isDirty}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
