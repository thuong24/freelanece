"use client";
import { useTimelines, useCreateTimeline } from "@/lib/hooks/useTimelines";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

interface TimelineFormData { title: string; description: string; }

export const TimelineList = ({ contractId, canAdd }: { contractId: string; canAdd: boolean }) => {
  const [showForm, setShowForm] = useState(false);
  const { data: timelines = [], isLoading } = useTimelines(contractId);
  const { mutate: create, isPending } = useCreateTimeline(contractId);
  const { register, handleSubmit, reset } = useForm<TimelineFormData>();

  const onSubmit = (data: TimelineFormData) => {
    create(data, { onSuccess: () => { reset(); setShowForm(false); } });
  };

  return (
    <div className="space-y-4">
      {canAdd && (
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Đóng" : "Cập nhật tiến độ"}
          </Button>

          {showForm && (
            <Card className="mt-3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Tiêu đề cập nhật" placeholder="VD: Hoàn thành module authentication" {...register("title", { required: true })} />
                <Textarea label="Mô tả chi tiết" placeholder="Mô tả những gì đã làm..." rows={3} {...register("description", { required: true })} />
                <Button type="submit" size="sm" loading={isPending}>Gửi cập nhật</Button>
              </form>
            </Card>
          )}
        </div>
      )}

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
        : timelines.length === 0
        ? <p className="text-slate-500 text-sm text-center py-6">Chưa có cập nhật tiến độ</p>
        : (
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-800" />
            {timelines.map((tl, i) => (
              <div key={tl.id} className="relative">
                <div className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-950" />
                <Card padding="sm">
                  <p className="text-slate-200 font-medium text-sm">{tl.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{tl.description}</p>
                  <p className="text-slate-600 text-xs mt-1">{formatDateTime(tl.createdAt)}</p>
                </Card>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};
