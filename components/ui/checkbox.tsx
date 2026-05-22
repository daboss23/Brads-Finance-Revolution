import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "mt-[1px] h-4 w-4 shrink-0 rounded border border-border bg-muted text-gold",
          "accent-gold cursor-pointer",
          className
        )}
        {...props}
      />
      {label && (
        <span className="text-[13px] text-foreground/75 leading-snug group-hover:text-foreground/90 transition-colors select-none">
          {label}
        </span>
      )}
    </label>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
