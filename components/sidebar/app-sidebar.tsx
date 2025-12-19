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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DonorData } from "@/app/api/user/route";

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
  const [user, setUser] = useState<DonorData | null>(null);
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
      setLoadingUser(true);
      const response = await fetch("/api/user");
      const { data: user } = await response.json();
      setUser(user);
      setLoadingUser(false);
    };

    if (mode !== "onboarding") getUser();

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
        <Drawer
          direction="right"
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        >
          <DrawerContent>
            <DrawerHeader aria-describedby={undefined}>
              <DrawerTitle>Editar perfil</DrawerTitle>
              <DrawerDescription>
                Editar los datos del Usuario
              </DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-2 p-4">
              <span className="font-bold">Nombre</span>
              <Input
                type="text"
                placeholder="Nombre"
                value={user?.name}
                onChange={() => {}}
              />

              <span className="font-bold">Apellido</span>
              <Input
                type="text"
                placeholder="Apellido"
                value={user?.lastname}
                onChange={() => {}}
              />

              <span className="font-bold">Contacto</span>
              <Input
                type="text"
                placeholder="Contacto"
                value={user?.phone}
                onChange={() => {}}
              />

              <span className="font-bold">Correo</span>
              <Input
                type="email"
                placeholder="Correo"
                value={user?.email}
                onChange={() => {}}
              />

              <span className="font-bold">Provincia</span>
              <Input
                type="text"
                placeholder="Provincia"
                value={user?.province}
                onChange={() => {}}
              />

              <span className="font-bold">Localidad</span>
              <Input
                type="text"
                placeholder="Localidad"
                value={user?.city}
                onChange={() => {}}
              />
            </div>

            <DrawerFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={() => setEditDialogOpen(false)}
              >
                Guardar Cambios
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer
          direction="right"
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        >
          <DrawerContent>
            <DrawerHeader aria-describedby={undefined}>
              <DrawerTitle>Cuenta</DrawerTitle>
              <DrawerDescription>Datos del Usuario</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-4 p-4">
              <span className="font-bold">Nombre</span>
              <span>{user?.name}</span>

              <span className="font-bold">Apellido</span>
              <span>{user?.lastname}</span>

              <span className="font-bold">Contacto</span>
              <span>{user?.phone}</span>

              <span className="font-bold">Correo</span>
              <span>{user?.email}</span>

              <span className="font-bold">Provincia</span>
              <span>{user?.province}</span>

              <span className="font-bold">Localidad</span>
              <span>{user?.city}</span>
            </div>

            <DrawerFooter>
              <Button
                className="w-1/2 mx-auto"
                onClick={() => setProfileDialogOpen(false)}
              >
                Cerrar
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

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
                      <span className="truncate">{user?.username}</span>
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
