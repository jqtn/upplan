"use client";

import { Menu, Home, Map, Activity, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

export default function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuItems = [
    { id: "home", label: "ホーム", icon: Home, href: "/", regex: /^\/$/ },
    {
      id: "roadmap",
      label: "ロードマップ",
      icon: Map,
      href: "/roadmaps",
      regex: /^\/roadmaps\/?.*/,
    },
    {
      id: "activity",
      label: "活動記録",
      icon: Activity,
      href: "/activities",
      regex: /^\/activities\/?.*/,
    },
    {
      id: "settings",
      label: "設定",
      icon: Settings,
      href: "/settings",
      regex: /^\/settings\/?.*/,
    },
  ];

  const activeTab =
    menuItems.find((item) => item.regex.test(pathname))?.id ?? "";

  return (
    <nav className="border-b bg-background flex-1">
      <div className="px-4">
        {/* PC版 - 横タブ */}
        <div className="hidden md:block py-4">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {menuItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* SP版 - ハンバーガーメニュー */}
        <div className="flex items-center justify-between py-4 md:hidden">
          <h1 className="text-lg font-semibold"></h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-lg font-semibold mb-4"></SheetTitle>
              <div className="flex flex-col gap-4 mt-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-base">{item.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
