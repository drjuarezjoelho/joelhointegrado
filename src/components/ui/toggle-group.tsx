import * as React from "react";
import { cn } from "@/lib/utils";

const ToggleGroupContext = React.createContext<{ type: "single" | "multiple"; value?: string | string[] }>({ type: "single" });

const ToggleGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple"; value?: string | string[] }>(
  ({ className, type = "single", value, children, ...props }, ref) => (
    <ToggleGroupContext.Provider value={{ type, value }}>
      <div ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
);
ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(
  ({ className, value: itemValue, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground", className)} data-value={itemValue} {...props} />
  )
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
