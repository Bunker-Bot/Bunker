import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import type { ViewMode } from "../types"

interface NavItem {
  title: string
  view: ViewMode
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    view: ViewMode
  }[]
}

interface NavMainProps {
  items: NavItem[]
  onSelectView: (view: ViewMode) => void
}

function NavMainItem({
  item,
  onSelectView
}: {
  item: NavItem
  onSelectView: (view: ViewMode) => void
}) {
  return (
    <SidebarMenuItem className="flex flex-col w-full group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
      <SidebarMenuButton
        tooltip={item.title}
        onClick={() => onSelectView(item.view)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto cursor-pointer ${item.isActive
            ? "bg-zinc-800/90 text-white font-semibold border border-white/10 shadow-sm"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
          }`}
      >
        <div className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-full">
          <span className="shrink-0 flex items-center justify-center group-data-[collapsible=icon]:mx-auto">{item.icon}</span>
          <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavMain({ items, onSelectView }: NavMainProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
      <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 group-data-[collapsible=icon]:hidden">
        Platform Navigation
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:w-full">
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} onSelectView={onSelectView} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
