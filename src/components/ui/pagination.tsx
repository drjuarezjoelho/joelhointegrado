import * as React from "react";
import { cn } from "@/lib/utils";

export function Pagination({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"nav">) {
  return <nav className={cn("", className)} {...props} />;
}
export function PaginationContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-2", className)} {...props} />;
}
export function PaginationItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) {
  return <li className={cn("", className)} {...props} />;
}
export function PaginationLink({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn("", className)} {...props} />;
}
export function PaginationPrevious({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn("", className)} {...props} />;
}
export function PaginationNext({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn("", className)} {...props} />;
}
