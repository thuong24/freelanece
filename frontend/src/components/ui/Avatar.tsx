import { getInitials } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export const Avatar = ({ name = "U", src, size = "md", className }: AvatarProps) => {
  const sizes = { 
    sm: "w-8 h-8 text-xs", 
    md: "w-10 h-10 text-sm", 
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
    "2xl": "w-32 h-32 text-3xl"
  };

  if (src) {
    return (
      <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />
    );
  }

  return (
    <div className={cn("rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white", sizes[size], className)}>
      {getInitials(name)}
    </div>
  );
};
