"use client";
import { useParams } from "next/navigation";
import { usePublicProfile, useUserReviews } from "@/lib/hooks/useUsers";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils/format";
import { Star, Briefcase, CheckCircle, Calendar, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: user, isLoading: profileLoading } = usePublicProfile(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useUserReviews(id);

  if (profileLoading) return <PageSpinner />;
  if (!user) return <div className="text-center py-20 text-slate-400">Không tìm thấy người dùng</div>;

  const reviews = reviewsData?.data ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Card */}
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20" />
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative">
            <div className="p-1 bg-slate-950 rounded-full">
              <Avatar src={user.avatarUrl} name={user.name} size="xl" className="border-4 border-slate-900 shadow-2xl" />
            </div>
            {user.ratingAvg >= 4.5 && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-950">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <Badge variant="info" className="uppercase tracking-widest text-[10px]">Verified</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Tham gia {formatDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-slate-100 font-bold">{user.ratingAvg.toFixed(1)}</span>
                <span className="opacity-50">({user.ratingCount} đánh giá)</span>
              </span>
            </div>
          </div>
          <div className="flex gap-3">
             {/* Action buttons could go here (e.g. Message, Invite) */}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Giới thiệu</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {user.bio || "Người dùng này chưa cập nhật tiểu sử."}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill: string) => (
                    <Badge key={skill} variant="purple" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm italic">Chưa cập nhật kỹ năng</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-slate-500">Job đã đăng</span>
                 <span className="text-white font-medium">{user._count?.postedJobs ?? 0}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-slate-500">Task hoàn thành</span>
                 <span className="text-white font-medium">{user._count?.freelancerContracts ?? 0}</span>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Đánh giá gần đây</h2>
            <Badge variant="default">{user.ratingCount} Reviews</Badge>
          </div>

          {reviewsLoading ? (
            <div className="py-10 flex justify-center"><PageSpinner /></div>
          ) : reviews.length === 0 ? (
            <Card className="py-20 text-center space-y-4 border-dashed border-slate-800">
               <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto opacity-20">
                 <Star className="w-8 h-8" />
               </div>
               <p className="text-slate-500">Chưa có đánh giá nào cho người dùng này.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id} className="p-6 hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={review.reviewer.avatarUrl} name={review.reviewer.name} size="sm" />
                      <div>
                        <p className="text-slate-100 font-semibold text-sm">{review.reviewer.name}</p>
                        <p className="text-slate-500 text-[11px]">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">{review.overallScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm italic">"{review.comment}"</p>
                  
                  <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-slate-800/50">
                    <div className="text-[10px] space-y-1">
                      <p className="text-slate-500 uppercase">Chất lượng</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-3 h-1 rounded-full ${i < review.codeQualityScore ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1">
                      <p className="text-slate-500 uppercase">Giao tiếp</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-3 h-1 rounded-full ${i < review.communicationScore ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1">
                      <p className="text-slate-500 uppercase">Tốc độ</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-3 h-1 rounded-full ${i < review.speedScore ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
