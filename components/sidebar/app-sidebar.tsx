"use client";
import {
  Building,
  ChartLine,
  ChevronUp,
  HandCoins,
  ListChecks,
  Loader2,
  User2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/actions/auth/sign-out";
import { Fragment, useState } from "react";
import { ProfileDrawer } from "./profile-drawer";
import { EditDrawer } from "./edit-drawer";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/logo";

const items = [
  {
    title: "Campañas",
    url: `/dashboard/campaigns`,
    icon: ListChecks,
  },
  {
    title: "Donaciones",
    url: `/dashboard/donations`,
    icon: HandCoins,
  },
  {
    title: "Instituciones",
    url: `/dashboard/institutions`,
    icon: Building,
  },
  {
    title: "Métricas",
    url: `/dashboard/metrics`,
    icon: ChartLine,
    role: "institution",
  },
];

export function AppSidebar({
  mode = "dashboard",
}: {
  mode?: "dashboard" | "onboarding";
}) {
  const queryClient = useQueryClient();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Usar el hook useUser para manejar el estado del usuario
  const {
    user,
    loading: loadingUser,
  } = useUser({
    enabled: mode !== "onboarding",
  });

  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;
  const logout = async () => {
    queryClient.clear();
    const result = await signOut();
    if (!result.ok) toast.error(result.error);
  };

  const popAccountDialog = () => setProfileDialogOpen(true);
  const popEditDialog = () => setEditDialogOpen(true);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-4">
        <Link className="flex items-center gap-2" href={"/"}>
          <Logo width={28} height={28} />
          <span className="font-heading text-base font-semibold tracking-tight">
            Donareasy
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {mode === "onboarding" ? null : (
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarMenu>
              {items.filter((item) => !item.role || item.role === user?.role).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="text-sidebar-foreground/70 data-[active=true]:text-sidebar-foreground data-[active=true]:[&>svg]:text-sidebar-primary"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <EditDrawer
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={user}
        />

        <ProfileDrawer
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          user={user}
        />

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton disabled={!!loadingUser}>
                  {loadingUser ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Fragment>
                      <User2 />
                      <span className="truncate">
                        {user?.role === "donor"
                          ? user?.name + " " + user?.lastname
                          : user?.name}
                      </span>
                      <ChevronUp className="ml-auto" />
                    </Fragment>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width)"
              >
                <DropdownMenuItem
                  disabled={mode === "onboarding"}
                  className="cursor-pointer"
                  onClick={popAccountDialog}
                >
                  <span>Cuenta</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={mode === "onboarding"}
                  className="cursor-pointer"
                  onClick={popEditDialog}
                >
                  <span>Editar perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
