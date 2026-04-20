"use client";
import { useHomeData } from "@/lib/hooks/useDiscovery";
import { JobCard } from "@/components/jobs/JobCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Star, Zap, Users, Award, TrendingUp, CheckCircle, 
  ArrowRight, Briefcase, Shield, Scale 
} from "lucide-react";
import Link from "next/link";
import { PageSpinner } from "@/components/ui/Spinner";

export const HomeContent = () => {
  const { data, isLoading } = useHomeData();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden min-h-[70vh] flex items-center">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <Badge variant="purple" className="px-4 py-1.5 text-xs uppercase tracking-widest animate-pulse border-indigo-500/50">
              Nền tảng Freelance Thế hệ mới
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent leading-[1.1] md:leading-tight">
            Kết nối tài năng. <br /> Bảo chứng niềm tin.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Hệ thống Escrow thông minh giúp freelancer an tâm làm việc, client hài lòng nhận kết quả. 
            Mọi giao dịch đều được bảo vệ 100%.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/jobs">
              <Button size="lg" className="px-8 h-14 text-lg shadow-xl shadow-indigo-500/20">
                Khám phá công việc <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/jobs/create">
              <Button variant="secondary" size="lg" className="px-8 h-14 text-lg border border-slate-800 bg-slate-900/50 backdrop-blur">
                Đăng tin ngay
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
             <Card className="text-center p-6 bg-slate-900/40 backdrop-blur-md border-slate-800/50 animate-float shadow-xl shadow-indigo-500/5">
               <p className="text-3xl font-extrabold text-white bg-gradient-to-br from-white to-indigo-400 bg-clip-text text-transparent">100%</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">An toàn Escrow</p>
             </Card>
             <Card className="text-center p-6 bg-slate-900/40 backdrop-blur-md border-slate-800/50 animate-float shadow-xl shadow-purple-500/5 [animation-delay:0.5s]">
               <p className="text-3xl font-extrabold text-white bg-gradient-to-br from-white to-purple-400 bg-clip-text text-transparent">24/7</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Hỗ trợ tranh chấp</p>
             </Card>
             <Card className="text-center p-6 bg-slate-900/40 backdrop-blur-md border-slate-800/50 animate-float shadow-xl shadow-red-500/5 [animation-delay:1s]">
               <p className="text-3xl font-extrabold text-white bg-gradient-to-br from-white to-red-400 bg-clip-text text-transparent">0%</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Rủi ro thanh toán</p>
             </Card>
             <Card className="text-center p-6 bg-slate-900/40 backdrop-blur-md border-slate-800/50 animate-float shadow-xl shadow-green-500/5 [animation-delay:1.5s]">
               <p className="text-3xl font-extrabold text-white bg-gradient-to-br from-white to-green-400 bg-clip-text text-transparent">1k+</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Freelancers</p>
             </Card>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Zap className="text-amber-400 w-8 h-8" /> Việc làm nổi bật
            </h2>
            <p className="text-slate-400 mt-2">Những cơ hội mới nhất đang chờ đợi bạn</p>
          </div>
          <Link href="/jobs" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group">
            Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.featuredJobs?.map((job: any) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Posters */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Users className="text-indigo-400 w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-100">Top nhà tuyển dụng</h3>
          </div>
          <div className="space-y-3">
            {data?.topPosters?.map((u: any, i: number) => (
              <Link key={u.id} href={`/users/${u.id}`} className="block">
                <Card className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors border-slate-800/50">
                  <div className="w-6 font-bold text-slate-600 text-base italic">#{i+1}</div>
                  <Avatar src={u.avatarUrl} name={u.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-semibold truncate text-sm">{u.name}</p>
                    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{u._count.postedJobs} bài đăng</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{u.ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Highest Rated */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Award className="text-amber-400 w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-100">Freelancer uy tín nhất</h3>
          </div>
          <div className="space-y-3">
            {data?.highestRated?.map((u: any, i: number) => (
              <Link key={u.id} href={`/users/${u.id}`} className="block">
                <Card className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors border-slate-800/50">
                  <div className="w-6 font-bold text-slate-600 text-base italic">#{i+1}</div>
                  <Avatar src={u.avatarUrl} name={u.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-semibold truncate text-sm">{u.name}</p>
                    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{u.ratingCount} đánh giá</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{u.ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Most Active Freelancers */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <TrendingUp className="text-green-400 w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-100">Hoạt động tích cực</h3>
          </div>
          <div className="space-y-3">
            {data?.mostActiveFreelancers?.map((u: any, i: number) => (
              <Link key={u.id} href={`/users/${u.id}`} className="block">
                <Card className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors border-slate-800/50 border-r-2 border-r-transparent hover:border-r-green-500">
                  <div className="w-6 font-bold text-slate-600 text-base italic">#{i+1}</div>
                  <Avatar src={u.avatarUrl} name={u.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-semibold truncate text-sm">{u.name}</p>
                    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{u._count.freelancerContracts} task hoàn thành</p>
                  </div>
                  <div className="text-right">
                     <div className="w-7 h-7 bg-green-500/10 rounded-full flex items-center justify-center">
                       <CheckCircle className="w-4 h-4 text-green-500" />
                     </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">Tại sao chọn FreelanceEscrow?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Nơi sự an toàn và chất lượng được đặt lên hàng đầu trong mọi giao dịch</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-3xl bg-slate-800/30 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-indigo-400 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-100 mb-3">Escrow Bảo mật</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Tiền của bạn được giam giữ an toàn bởi hệ thống và chỉ được giải ngân khi các cột mốc công việc được nghiệm thu.</p>
            </div>
            <div className="group p-8 rounded-3xl bg-slate-800/30 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/[0.02] transition-all duration-300">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scale className="text-purple-400 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-100 mb-3">Phân xử Công minh</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Đội ngũ Admin và hệ thống bằng chứng minh bạch sẵn sàng hỗ trợ giải quyết mọi tranh chấp một cách khách quan nhất.</p>
            </div>
            <div className="group p-8 rounded-3xl bg-slate-800/30 border border-slate-800 hover:border-green-500/50 hover:bg-green-500/[0.02] transition-all duration-300">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-green-400 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-100 mb-3">Tối ưu Tốc độ</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Quy trình từ lúc đăng tin đến khi chốt deal và nhận tiền được tối ưu hóa, giúp bạn tiết kiệm thời gian quý báu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-6xl mx-auto px-4 text-center py-10">
        <Card className="p-10 md:p-16 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 border-none relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Bắt đầu hành trình của bạn <br /> ngay hôm nay!</h2>
            <p className="text-indigo-100 text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              Hàng ngàn công việc chất lượng và những tài năng hàng đầu đang chờ đợi bạn. 
              Hãy gia nhập cộng đồng freelance an toàn nhất ngay bây giờ.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="px-10 h-14 text-lg bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-xl">
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="px-10 h-14 text-lg border-white/30 text-white hover:bg-white/10 font-bold">
                  Tìm việc ngay
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
