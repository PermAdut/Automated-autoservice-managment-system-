import { forwardRef } from "react";
import { Input } from "./input";
import { cn } from "../../lib/utils";

export interface InputWithIconProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  icon?: React.ReactNode;
  value?: string;
}

const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon, value = "", className, ...props }, ref) => {
    const hasValue = (value ?? "").trim().length > 0;
    const showIcon = icon && !hasValue;

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          value={value}
          className={cn(
            showIcon ? "pr-10" : "pr-4",
            className
          )}
          {...props}
        />
        {showIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
            {icon}
          </span>
        )}
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
