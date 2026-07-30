import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  Notification01Icon,
  Logout01Icon,
  SecurityCheckIcon
} from "@hugeicons/core-free-icons"
import type { ViewMode } from "../types"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  onSelectView?: (view: ViewMode) => void
  onLogout?: () => void
}

export function NavUser({ user, onSelectView, onLogout }: NavUserProps) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const initial = (user.name || user.email || 'A').trim().charAt(0).toUpperCase();

  const handleNavigateTab = (tab: string) => {
    if (onSelectView) {
      onSelectView("settings")
    }
    navigate(`/app/settings?tab=${tab}`)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex justify-center group-data-[collapsible=icon]:justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-9"
              >
                <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:justify-center">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800/90 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div className="grid text-left leading-tight truncate group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-xs font-semibold text-zinc-200">
                      {user.name}
                    </span>
                    <span className="truncate text-[10px] text-zinc-500 font-mono">
                      {user.email}
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-56 bg-[rgba(15,15,17,0.98)] backdrop-blur-2xl border border-zinc-800/90 rounded-xl text-xs text-zinc-200 shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800/90 flex items-center justify-center font-extrabold text-xs text-white shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div className="grid text-left leading-tight truncate">
                    <span className="truncate text-xs font-semibold text-white">
                      {user.name}
                    </span>
                    <span className="truncate text-[10px] text-zinc-500 font-mono">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => handleNavigateTab("profile")}
                className="cursor-pointer gap-2 p-2 hover:bg-zinc-800/80 rounded-lg"
              >
                <HugeiconsIcon icon={Settings01Icon} size={14} />
                <span>Account & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavigateTab("notifications")}
                className="cursor-pointer gap-2 p-2 hover:bg-zinc-800/80 rounded-lg"
              >
                <HugeiconsIcon icon={Notification01Icon} size={14} />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNavigateTab("security")}
                className="cursor-pointer gap-2 p-2 hover:bg-zinc-800/80 rounded-lg"
              >
                <HugeiconsIcon icon={SecurityCheckIcon} size={14} />
                <span>Security & Tokens</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => onLogout?.()}
              className="cursor-pointer gap-2 p-2 hover:bg-zinc-800/80 rounded-lg text-rose-400 hover:text-rose-300"
            >
              <HugeiconsIcon icon={Logout01Icon} size={14} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
