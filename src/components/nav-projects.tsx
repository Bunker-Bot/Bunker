import React from "react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalIcon,
  Folder01Icon,
  Add01Icon
} from "@hugeicons/core-free-icons"
import type { ViewMode } from "../types"

export interface NavProjectItem {
  id?: string
  name: string
  view: ViewMode
  icon: React.ReactNode
}

interface NavProjectsProps {
  projects: NavProjectItem[]
  onSelectView: (view: ViewMode) => void
  onOpenCreateProject?: () => void
}

export function NavProjects({
  projects,
  onSelectView,
  onOpenCreateProject,
}: NavProjectsProps) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const handleProjectClick = (item: NavProjectItem) => {
    if (item.id) {
      navigate(`/app/projects/${item.id}`)
    } else {
      onSelectView("projects")
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 flex items-center justify-between">
        <span>Active Projects</span>
        <span className="text-[9px] text-zinc-600 font-mono">({projects.length})</span>
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.length === 0 ? (
          <div className="px-3 py-2 text-[11px] text-zinc-500 font-mono">
            No projects in database
          </div>
        ) : (
          projects.map((item) => (
            <SidebarMenuItem key={item.id || item.name}>
              <SidebarMenuButton
                onClick={() => handleProjectClick(item)}
                className="text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-[12px] px-3 py-2 transition-colors cursor-pointer"
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  nativeButton={false}
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  }
                />
                <DropdownMenuContent
                  className="w-48 bg-[rgba(17,17,19,0.95)] backdrop-blur-xl border border-zinc-800 text-xs text-zinc-200"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => handleProjectClick(item)} className="cursor-pointer">
                    <HugeiconsIcon icon={Folder01Icon} size={14} className="mr-2" />
                    <span>View Workspace</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={onOpenCreateProject}
            className="text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-[12px] px-3 py-2 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} className="text-zinc-400" />
            <span>Create New Project</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
