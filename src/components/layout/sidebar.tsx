"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wand2,
  VideoIcon,
  LayoutTemplate,
  Settings,
  Shield,
  Video,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/generate", label: "Generar Video", icon: Wand2 },
  { href: "/videos", label: "Mis Videos", icon: VideoIcon },
  { href: "/templates", label: "Plantillas", icon: LayoutTemplate },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

const adminItems = [
  { href: "/admin", label: "Administracion", icon: Shield },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Video className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">UGC Studio</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {allItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-3 py-4">
        <div className="rounded-lg bg-muted px-3 py-3">
          <p className="text-xs font-medium text-muted-foreground">Plan Actual</p>
          <p className="text-sm font-bold capitalize">
            {(session?.user as { planId?: string })?.planId || "free"}
          </p>
        </div>
      </div>
    </div>
  );
}
