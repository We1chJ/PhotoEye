'use client'
import { Map, Settings, Trophy, User, PlaneTakeoff, Gauge, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import NextLink from "next/link"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import MapDrawer from "./MapDrawer"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function AppSidebar() {
  const { state } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const isCollapsed = state === "collapsed"

  // Fix hydration issue
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a skeleton during SSR to prevent hydration mismatch
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-2 p-2">
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-2">
              <NextLink href="/">
                <img
                  src="/photoeye-light.png"
                  alt="PhotoEye"
                  className="!size-8 dark:hidden"
                />
                <img
                  src="/photoeye.png"
                  alt="PhotoEye"
                  className="!size-8 hidden dark:block"
                />
                <span className="text-lg font-semibold">PhotoEye</span>
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Play</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Explore">
                  <NextLink href="/game">
                    <PlaneTakeoff />
                    <span>Explore</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <MapDrawer />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Share</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <NextLink href="/game/dashboard">
                    <Gauge />
                    <span>Dashboard</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Leaderboard">
                  <NextLink href="/game/leaderboard">
                    <Trophy />
                    <span>Leaderboard</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Discover">
                  <NextLink href="/game/discover">
                    <Search />
                    <span>Discover</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NextLink href="/game/settings">
                <Settings />
                <span>Settings</span>
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}