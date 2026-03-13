import * as React from "react";
import { cn } from "@/lib/utils";

export function Menubar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)} {...props} />;
}
export function MenubarMenu({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
export function MenubarTrigger({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("", className)} {...props} />;
}
export function MenubarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}
export function MenubarItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}
