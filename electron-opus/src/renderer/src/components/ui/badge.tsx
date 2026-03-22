import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white",
        secondary:
          "border-transparent bg-gray-100 text-gray-800",
        destructive:
          "border-red-200 bg-red-100 text-red-700",
        outline:
          "border-gray-300 text-gray-700 bg-white",
        success:
          "border-green-200 bg-green-100 text-green-700",
        warning:
          "border-yellow-200 bg-yellow-100 text-yellow-800",
        info:
          "border-blue-200 bg-blue-100 text-blue-700",
        purple:
          "border-purple-200 bg-purple-100 text-purple-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
