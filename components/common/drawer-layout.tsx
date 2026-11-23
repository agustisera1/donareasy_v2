import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface DrawerLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  /** Drawers de lectura con cards en grilla (detalle, perfil, métricas). */
  wide?: boolean;
}

export function DrawerLayout({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  wide = false,
}: DrawerLayoutProps) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={wide ? "data-[vaul-drawer-direction=right]:sm:max-w-lg" : undefined}>
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-4">
          {children}
        </div>

        <DrawerFooter className="flex-row justify-between border-t">
          {footer}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
