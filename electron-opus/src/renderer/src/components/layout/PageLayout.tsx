import { cn } from "../../lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 flex flex-col w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-screen-2xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
