import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border bg-bg-secondary px-4 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
              : "border-glass-border",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };