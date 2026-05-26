import { FC, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ModalOverlayProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  zIndex?: "default" | "high";
}

export const ModalOverlay: FC<ModalOverlayProps> = ({
  children,
  className,
  onClick,
  zIndex = "default",
}) => (
  <div
    className={cn(
      "fixed inset-0 flex items-center justify-center bg-black/50 p-5",
      zIndex === "high" ? "z-[1000]" : "z-50",
      className,
    )}
    onClick={onClick}
  >
    {children}
  </div>
);
