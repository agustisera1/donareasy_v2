"use client";
import {
  Banknote,
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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Fragment, useEffect, useState } from "react";
import { DonorData, InstitutionData } from "@/app/api/user/route";
import { ProfileDrawer } from "./profile-drawer";
import { EditDrawer } from "./edit-drawer";

const items = [
  {
    title: "Campañas",
    url: `/dashboard/campaign`,
    icon: ListChecks,
  },
  {
    title: "Instituciones",
    url: `/dashboard/institutions`,
    icon: Building,
  },
  {
    title: "Metricas",
    url: `/dashboard/metrics`,
    icon: ChartLine,
  },
  {
    title: "Donaciones",
    url: `/dashboard/donations/`,
    icon: HandCoins,
    children: [
      {
        title: "Monetarias",
        url: `/dashboard/donations/money`,
        icon: Banknote,
      },
      {
        title: "Bienes",
        url: `/dashboard/donations/needs`,
        icon: HandCoins,
      },
    ],
  },
];

export function AppSidebar({
  mode = "dashboard",
}: {
  mode?: "dashboard" | "onboarding";
}) {
  const router = useRouter();
  const groupItems = items.filter((item) => item.children);
  const simpleItems = items.filter((item) => !item.children);
  const [user, setUser] = useState<DonorData | InstitutionData | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  useEffect(() => {
    const getUser = async () => {
      if (mode === "onboarding") return;
      setLoadingUser(true);
      const response = await fetch("/api/user");
      const { data: user } = await response.json();
      setUser(user);
      setLoadingUser(false);
    };

    getUser();

    return () => {
      setLoadingUser(false);
      setUser(null);
    };
  }, [mode]);

  const popAccountDialog = () => setProfileDialogOpen(true);
  const popEditDialog = () => setEditDialogOpen(true);

  return (
    <Sidebar>
      <SidebarContent className="bg-background w-[12rem]">
        <SidebarHeader className="p-4 pb-0">
          <Link className="text-xl font-bold" href={"/"}>
            Donareasy
          </Link>
        </SidebarHeader>

        {mode === "onboarding" ? null : (
          <Fragment>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>

              {simpleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>

            <Separator />
            {groupItems.map((item) => (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.children!.map((child) => (
                      <SidebarMenuItem key={child.title}>
                        <SidebarMenuButton asChild>
                          <Link href={child.url}>
                            <child.icon />
                            <span>{child.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </Fragment>
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
