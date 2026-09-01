import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  FolderCheckIcon,
  UserGroupIcon,
  Task01Icon,
  GitBranchIcon,
  FileCodeIcon,
  Clock01Icon,
  Settings01Icon,
  Folder01Icon,
  MoneyBagIcon,
  Tag01Icon,
  LockKeyIcon,
  Flag01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { NavMain } from "./nav-main"
import { NavProjects, type NavProjectItem } from "./nav-projects"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar"
import type { ViewMode } from "../types"
import { AppLogo } from "./ui/AppLogo"
import { useProjects } from "../lib/supabase/queries/projects"
import { useProfileSettings } from "../modules/settings/hooks/useSettings"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentView: ViewMode
  onSelectView: (view: ViewMode) => void
  onOpenCreateProject?: () => void
  onLogout?: () => void
}

export function AppSidebar({
  currentView,
  onSelectView,
  onOpenCreateProject,
  onLogout,
  ...props
}: AppSidebarProps) {
  const { data: profile } = useProfileSettings()

  const user = {
    name: profile?.fullName || "Eswar Chinthakayala",
    email: profile?.email || "eswarchinthakayala2004@gmail.com",
    avatar: profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  }

  const { data: projectsResult } = useProjects()

  const activeProjects: NavProjectItem[] = React.useMemo(() => {
    const raw =
      (projectsResult as any)?.projects ||
      (Array.isArray(projectsResult) ? projectsResult : [])

    return raw.map((p: any) => ({
      id: String(p.id),
      slug: p.slug || String(p.id),
      name: p.name || "Untitled Project",
      view: "projects" as ViewMode,
      icon: <HugeiconsIcon icon={Folder01Icon} size={16} />,
    }))
  }, [projectsResult])

  const navMain = [
    {
      title: "Dashboard Overview",
      view: "dashboard" as ViewMode,
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} size={16} />,
      isActive: currentView === "dashboard",
    },
    {
      title: "Client Projects",
      view: "projects" as ViewMode,
      icon: <HugeiconsIcon icon={FolderCheckIcon} size={16} />,
      isActive: currentView === "projects",
    },
    {
      title: "Client Directory",
      view: "clients" as ViewMode,
      icon: <HugeiconsIcon icon={UserGroupIcon} size={16} />,
      isActive: currentView === "clients",
    },
    {
      title: "Collaborative Teams",
      view: "teams" as ViewMode,
      icon: <HugeiconsIcon icon={UserGroupIcon} size={16} />,
      isActive: currentView === "teams",
    },
    {
      title: "Avatar Studio",
      view: "avatar-studio" as ViewMode,
      icon: <HugeiconsIcon icon={SparklesIcon} size={16} />,
      isActive: currentView === "avatar-studio",
    },
    {
      title: "Tasks & Kanban",
      view: "tasks" as ViewMode,
      icon: <HugeiconsIcon icon={Task01Icon} size={16} />,
      isActive: currentView === "tasks",
    },
    {
      title: "GitHub Repositories",
      view: "github" as ViewMode,
      icon: <HugeiconsIcon icon={GitBranchIcon} size={16} />,
      isActive: currentView === "github",
    },
    {
      title: "Documentation & Specs",
      view: "docs" as ViewMode,
      icon: <HugeiconsIcon icon={FileCodeIcon} size={16} />,
      isActive: currentView === "docs",
    },
    {
      title: "Payments & Finances",
      view: "payments" as ViewMode,
      icon: <HugeiconsIcon icon={MoneyBagIcon} size={16} />,
      isActive: currentView === "payments",
    },
    {
      title: "Changelog & Version Notes",
      view: "changelog" as ViewMode,
      icon: <HugeiconsIcon icon={Tag01Icon} size={16} />,
      isActive: currentView === "changelog",
    },
    {
      title: "Private Notes Workspace",
      view: "notes" as ViewMode,
      icon: <HugeiconsIcon icon={LockKeyIcon} size={16} />,
      isActive: currentView === "notes",
    },
    {
      title: "Deployments & Status",
      view: "deployments" as ViewMode,
      icon: <HugeiconsIcon icon={FileCodeIcon} size={16} />,
      isActive: currentView === "deployments",
    },
    {
      title: "Timelines & Roadmap",
      view: "timeline" as ViewMode,
      icon: <HugeiconsIcon icon={Clock01Icon} size={16} />,
      isActive: currentView === "timeline",
    },
    {
      title: "Project Milestones",
      view: "milestones" as ViewMode,
      icon: <HugeiconsIcon icon={Flag01Icon} size={16} />,
      isActive: currentView === "milestones",
    },
    {
      title: "Share Links & Access",
      view: "share-links" as ViewMode,
      icon: <HugeiconsIcon icon={Folder01Icon} size={16} />,
      isActive: currentView === "share-links",
    },
    {
      title: "Settings & API",
      view: "settings" as ViewMode,
      icon: <HugeiconsIcon icon={Settings01Icon} size={16} />,
      isActive: currentView === "settings",
    },
  ]

  return (
    <Sidebar collapsible="icon" className="bg-[#09090b] border-r border-zinc-800/80 shadow-2xl" {...props}>
      <SidebarHeader className="bg-[#09090b] border-b border-zinc-800/80 px-3.5 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center group-data-[collapsible=icon]:justify-center w-full">
          <AppLogo size={28} showText={true} />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-[#09090b] custom-scrollbar">
        <NavMain items={navMain} onSelectView={onSelectView} />
        <NavProjects 
          projects={activeProjects} 
          onSelectView={onSelectView}
          onOpenCreateProject={onOpenCreateProject} 
        />
      </SidebarContent>

      <SidebarFooter className="bg-[#09090b] border-t border-zinc-800/80 pt-2">
        <NavUser user={user} onLogout={onLogout} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
