import { useState, useRef, useEffect } from "react";
import { useMessages, useSendMessage } from "@/lib/hooks/useChats";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { Send, ShieldAlert, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const ChatBox = ({ contractId }: { contractId: string }) => {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMessages(contractId); // Currently limited to page 1 by default
  const { mutate: send, isPending } = useSendMessage(contractId);

  const messages = data?.data ?? [];
  const meta = data?.meta;

  // Tự động cuộn xuống dưới khi có tin mới hoặc lần đầu vào
  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isLoading]);

  const handleSend = () => {
    if (!text.trim()) return;
    send(text, { onSuccess: () => setText("") });
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700"
      >
        {/* Load more button if there's more data */}
        {meta && meta.page < meta.totalPages && (
          <div className="flex justify-center pb-2">
            <Button variant="ghost" size="xs" className="text-xs text-slate-500 hover:text-indigo-400">
              <ChevronUp className="w-3 h-3 mr-1" /> Xem tin nhắn cũ hơn
            </Button>
          </div>
        )}

        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2 ml-auto"}`} />)
          : messages.length === 0
          ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </div>
          )
          : messages.map((msg: any) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm transition-all duration-200",
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20"
                    : "bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700",
                  msg.isCensored && "opacity-60"
                )}>
                  {msg.isCensored && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-1 font-medium">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Nội dung vi phạm đã bị ẩn</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1.5 opacity-60", isMe ? "text-indigo-100" : "text-slate-400")}>
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4 bg-slate-900/50 backdrop-blur-sm flex gap-2">
        <input
          className="flex-1 bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          placeholder="Nhắn tin... (không dùng thông tin liên hệ cá nhân)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <Button 
          onClick={handleSend} 
          loading={isPending} 
          disabled={!text.trim()}
          className="rounded-xl px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
