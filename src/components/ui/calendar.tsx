import * as React from "react";
import { cn } from "@/lib/utils";

export function Calendar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-3", className)} {...props} />;
}
