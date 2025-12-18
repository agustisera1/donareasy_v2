import {
  Banknote,
  Building,
  ChartLine,
  HandCoins,
  ListChecks,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Separator } from "../ui/separator";

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
  const groupItems = items.filter((item) => item.children);
  const simpleItems = items.filter((item) => !item.children);
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
        <SidebarGroup></SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
