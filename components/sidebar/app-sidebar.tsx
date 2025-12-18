"use client";
import {
  Banknote,
  Building,
  ChartLine,
  ChevronUp,
  HandCoins,
  ListChecks,
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
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const items = [
  {
    title: "Instituciones",
    url: `/dashboard/institutions`,
    icon: Building,
  },
  {
    title: "Campañas",
    url: `/dashboard/campaign`,
    icon: ListChecks,
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

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const groupItems = items.filter((item) => item.children);
  const simpleItems = items.filter((item) => !item.children);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const router = useRouter();
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) {
        setUser(data.claims as unknown as User);
      }
    };

    getUser();
  }, []);

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
              <Input type="text" placeholder="Nombre" value="Juan" />

              <span className="font-bold">Apellido</span>
              <Input type="text" placeholder="Apellido" value="Perez" />

              <span className="font-bold">Contacto</span>
              <Input
                type="text"
                placeholder="Contacto"
                value="+54 9 11 1234-5678"
              />

              <span className="font-bold">Correo</span>
              <Input type="email" placeholder="Correo" value={user?.email} />

              <span className="font-bold">Provincia</span>
              <Input type="text" placeholder="Provincia" value="Buenos Aires" />

              <span className="font-bold">Localidad</span>
              <Input
                type="text"
                placeholder="Localidad"
                value="Capital Federal"
              />
            </div>

            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>

              <Button variant="default">Guardar Cambios</Button>
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
              <span>Juan</span>

              <span className="font-bold">Apellido</span>
              <span>Perez</span>

              <span className="font-bold">Contacto</span>
              <span>+54 9 11 1234-5678</span>

              <span className="font-bold">Correo</span>
              <span>{user?.email}</span>

              <span className="font-bold">Provincia</span>
              <span>Buenos Aires</span>

              <span className="font-bold">Localidad</span>
              <span>Capital Federal</span>
            </div>

            <DrawerFooter>
              <DrawerClose>
                <Button variant="default">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="max-w-[11rem]">
                  <User2 /> <span className="truncate">{user?.email}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={popAccountDialog}
                >
                  <span>Cuenta</span>
                </DropdownMenuItem>
                <DropdownMenuItem
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
