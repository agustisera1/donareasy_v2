"use client";
import {
  Building,
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
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Fragment, useState } from "react";
import { ProfileDrawer } from "./profile-drawer";
import { EditDrawer } from "./edit-drawer";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/logo";

const items = [
  {
    title: "Campañas",
    url: `/dashboard/campaign`,
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
];

export function AppSidebar({
  mode = "dashboard",
}: {
  mode?: "dashboard" | "onboarding";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Usar el hook useUser para manejar el estado del usuario
  const {
    user,
    loading: loadingUser,
    refetch,
  } = useUser({
    enabled: mode !== "onboarding",
  });

  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Limpiar el cache de TanStack Query, especialmente el del usuario
    queryClient.removeQueries({ queryKey: ["user"] });
    queryClient.clear(); // Limpiar todo el cache para evitar datos de sesión anterior
    router.push("/auth/login");
  };

  const popAccountDialog = () => setProfileDialogOpen(true);
  const popEditDialog = () => setEditDialogOpen(true);

  return (
    <Sidebar>
      <SidebarContent className="bg-background w-[12rem]">
        <SidebarHeader className="p-4 pb-0">
          <Link className="flex items-center gap-2" href={"/"}>
            <Logo width={40} height={40} />
            <span className="text-xl font-bold">Donareasy</span>
          </Link>
        </SidebarHeader>

        {mode === "onboarding" ? null : (
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>

            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.url)}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <EditDrawer
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={user}
          onUpdateSuccess={refetch}
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
                <SidebarMenuButton
                  disabled={!!loadingUser}
                  className="max-w-[11rem]"
                >
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
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem
                  disabled={mode === "onboarding"}
                  className="cursor-pointer"
                  onClick={popAccountDialog}
                >
                  <span>Perfil</span>
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
