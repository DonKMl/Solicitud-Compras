import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("bg-white p-2 rounded flex items-center justify-center", className)}>
      <img 
        src="/images/logo-inverlache.svg" 
        alt="Inversiones Lache" 
        className="h-auto max-w-full w-48" 
      />
    </div>
  );
}
