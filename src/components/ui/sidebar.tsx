import * as React from "react";
import { makeButton, makeDiv } from "./stub";

type SidebarState = "expanded" | "collapsed";

const SidebarCtx = React.createContext<{ state: SidebarState; toggleSidebar: () => void }>({
  state: "expanded",
  toggleSidebar: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarCtx);
}

export function SidebarProvider({ children, ...props }: Record<string, any>) {
  const [state, setState] = React.useState<SidebarState>("expanded");
  const toggleSidebar = React.useCallback(() => {
    setState((s) => (s === "expanded" ? "collapsed" : "expanded"));
  }, []);

  return (
    <SidebarCtx.Provider value={{ state, toggleSidebar }}>
      <div data-collapsible={state === "collapsed" ? "icon" : "full"} {...props}>
        {children}
      </div>
    </SidebarCtx.Provider>
  );
}

export const Sidebar = makeDiv("Sidebar");
export const SidebarContent = makeDiv("SidebarContent");
export const SidebarFooter = makeDiv("SidebarFooter");
export const SidebarHeader = makeDiv("SidebarHeader");
export const SidebarInset = makeDiv("SidebarInset");
export const SidebarMenu = makeDiv("SidebarMenu");
export const SidebarMenuItem = makeDiv("SidebarMenuItem");
export const SidebarMenuButton = makeButton("SidebarMenuButton");
export const SidebarTrigger = makeButton("SidebarTrigger");
