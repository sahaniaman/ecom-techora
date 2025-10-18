"use client"

import { UserButton } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronUp,
  Home,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Section,
  Settings,
  TowerControl,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggleButton } from "../ui/skiper-ui/skiper26";
import { cn } from "@/lib/utils";

interface SIDEBAR_ITEM {
  label: string;
  icon?: LucideIcon;
  url?: string;
  items?: SIDEBAR_ITEM[];
}

interface SIDEBAR_SECTION {
  label: string;
  icon?: LucideIcon;
  url?: string;
  items?: SIDEBAR_ITEM[];
}

const sections: SIDEBAR_SECTION[] = [
  {
    label: "Sections",
    icon: Section,
    items: [
      {
        label: "Dashboard",
        url: "/superadmin",
        icon: LayoutDashboard,
      },
      {
        label: "Management",
        url: "/superadmin/management",
        icon: Settings,
      },
      {
        label: "CMS",
        url: "/superadmin/cms-controls",
        icon: TowerControl,
      },
    ],
  },
  {
    label: "Dashboard",
    url: "/superadmin",
    icon: LayoutDashboard,
  },
  {
    label: "Management",
    icon: Settings,
    items: [
      {
        label: "Users",
        icon: Users2,
        items: [
          {
            label: "All Users",
            url: "/superadmin/management/users",
          },
          {
            label: "Admins",
            url: "/superadmin/management/users?role=ADMIN",
          },
          {
            label: "Vendors",
            url: "/superadmin/management/users?role=VENDOR",
          },
        ],
      },
      {
        label: "Products",
        icon: Package,
        items: [
          {
            label: "All Products",
            url: "/superadmin/management/products",
          },
          {
            label: "Add Product",
            url: "/superadmin/management/products/add",
          },
        ],
      },
    ],
  },
];

const SuperAdminDashboardSideBar = () => {
  const { state } = useSidebar();
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(["Sections", "Management"]),
  );

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel);
      } else {
        newSet.add(groupLabel);
      }
      return newSet;
    });
  };

  const isGroupOpen = (groupLabel: string) => openGroups.has(groupLabel);
  const isCollapsed = state === "collapsed";

  // Check if a URL is active
  const isActiveLink = (url?: string): boolean => {
    if (!url) return false;
    
    // Exact match for root paths
    if (url === "/superadmin" && pathname === "/superadmin") return true;
    
    // For paths with query parameters, check only the pathname
    const cleanUrl = url.split('?')[0];
    const cleanPathname = pathname.split('?')[0];
    
    // Check if current pathname starts with the URL (for nested routes)
    return cleanPathname === cleanUrl || cleanPathname.startsWith(`${cleanUrl}/`);
  };

  // Check if any child item is active (for auto-expanding groups)
  const hasActiveChild = (items?: SIDEBAR_ITEM[]): boolean => {
    if (!items) return false;
    
    return items.some(item => {
      if (item.url && isActiveLink(item.url)) return true;
      if (item.items) return hasActiveChild(item.items);
      return false;
    });
  };

  // Auto-expand groups that contain active items
  const autoExpandGroups = () => {
    sections.forEach(section => {
      if (section.items && hasActiveChild(section.items)) {
        setOpenGroups(prev => new Set(prev).add(section.label));
      }
      
      section.items?.forEach(item => {
        if (item.items && hasActiveChild(item.items)) {
          setOpenGroups(prev => new Set(prev).add(`${section.label}-${item.label}`));
        }
      });
    });
  };

  // Run auto-expand on mount and when pathname changes
  useState(() => {
    autoExpandGroups();
  });

  const getButtonClasses = (isActive: boolean, level: number = 0) => {
    const baseClasses = "transition-all duration-300 ease-in-out active:scale-[0.98] my-1";
    
    if (isActive) {
      return cn(
        baseClasses,
        "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25",
        level === 0 ? "rounded-xl" : "rounded-lg",
        "hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-blue-600/30"
      );
    }
    
    return cn(
      baseClasses,
      "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700",
      level === 0 ? "rounded-xl hover:shadow-sm" : "rounded-lg hover:translate-x-1",
      level > 1 && "hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80"
    );
  };

  return (
    <Sidebar className="border-r border-gray-200" collapsible="icon">
      <SidebarContent className="px-2 py-4">
        {sections.map((section) => {
          const isSectionActive = isActiveLink(section.url);
          const sectionHasActiveChild = hasActiveChild(section.items);

          // If section has a direct URL, render as simple button
          if (section.url) {
            return (
              <SidebarMenu key={section.label}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={getButtonClasses(isSectionActive, 0)}
                  >
                    <Link
                      href={section.url}
                      className="flex items-center gap-3 py-3 px-3"
                    >
                      {section.icon && (
                        <section.icon 
                          className={cn(
                            "w-5 h-5 flex-shrink-0 transition-colors",
                            isSectionActive ? "text-white" : "text-gray-600"
                          )} 
                        />
                      )}
                      <span className={cn(
                        "truncate font-medium transition-colors",
                        isSectionActive ? "text-white" : "text-gray-900"
                      )}>
                        {section.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            );
          }

          // If section has items with URLs, render as expandable group
          if (
            section.items &&
            section.items.some((item) => item.url && !item.items)
          ) {
            const isOpen = isGroupOpen(section.label) || sectionHasActiveChild;

            return (
              <SidebarGroup
                key={section.label}
                className="border-b border-gray-100/50 last:border-b-0 pb-3 mb-3"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(section.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ease-in-out group",
                    isCollapsed ? 'justify-center' : '',
                    sectionHasActiveChild 
                      ? "bg-blue-50 border border-blue-200" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className={cn("flex items-center gap-3", isCollapsed ? '' : 'flex-1')}>
                    {section.icon && (
                      <section.icon className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        sectionHasActiveChild ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                      )} />
                    )}
                    {!isCollapsed && (
                      <SidebarGroupLabel className={cn(
                        "text-xs font-bold uppercase tracking-wider transition-colors",
                        sectionHasActiveChild ? "text-blue-700" : "text-gray-600 group-hover:text-gray-800"
                      )}>
                        {section.label}
                      </SidebarGroupLabel>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-shrink-0 ml-2">
                      {isOpen ? (
                        <ChevronUp className={cn(
                          "w-4 h-4 transition-all duration-300",
                          sectionHasActiveChild ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                        )} />
                      ) : (
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-all duration-300",
                          sectionHasActiveChild ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                        )} />
                      )}
                    </div>
                  )}
                </button>

                {isOpen && !isCollapsed && (
                  <SidebarGroupContent className="mt-1">
                    <SidebarMenu>
                      {section.items.map((item) => {
                        const isItemActive = isActiveLink(item.url);
                        
                        return (
                          <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                              asChild
                              className={getButtonClasses(isItemActive, 1)}
                            >
                              <Link
                                href={item.url || "#"}
                                className="flex items-center gap-3 py-2.5 pl-8 pr-3"
                              >
                                {item.icon && (
                                  <item.icon className={cn(
                                    "w-4 h-4 flex-shrink-0 transition-colors",
                                    isItemActive ? "text-white" : "text-gray-500"
                                  )} />
                                )}
                                <span className={cn(
                                  "truncate transition-colors",
                                  isItemActive ? "text-white font-medium" : "text-gray-700"
                                )}>
                                  {item.label}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          }

          // If section has nested items (multi-level), render as collapsible
          const isOpen = isGroupOpen(section.label) || sectionHasActiveChild;

          return (
            <SidebarGroup
              key={section.label}
              className="border-b border-gray-100/50 last:border-b-0 pb-3 mb-3"
            >
              <button
                type="button"
                onClick={() => toggleGroup(section.label)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ease-in-out group",
                  isCollapsed ? 'justify-center' : '',
                  sectionHasActiveChild 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-gray-50"
                )}
              >
                <div className={cn("flex items-center gap-3", isCollapsed ? '' : 'flex-1')}>
                  {section.icon && (
                    <section.icon className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      sectionHasActiveChild ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                    )} />
                  )}
                  {!isCollapsed && (
                    <SidebarGroupLabel className={cn(
                      "text-xs font-bold uppercase tracking-wider transition-colors",
                      sectionHasActiveChild ? "text-blue-700" : "text-gray-600 group-hover:text-gray-800"
                    )}>
                      {section.label}
                    </SidebarGroupLabel>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-shrink-0 ml-2">
                    {isOpen ? (
                      <ChevronUp className={cn(
                        "w-4 h-4 transition-all duration-300",
                        sectionHasActiveChild ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                    ) : (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-all duration-300",
                        sectionHasActiveChild ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                    )}
                  </div>
                )}
              </button>

              {isOpen && !isCollapsed && (
                <SidebarGroupContent className="mt-1">
                  {section.items?.map((item) => {
                    const itemHasActiveChild = hasActiveChild(item.items);
                    const isSubGroupOpen = isGroupOpen(`${section.label}-${item.label}`) || itemHasActiveChild;

                    return (
                      <SidebarGroup key={item.label} className="ml-2">
                        <button
                          type="button"
                          onClick={() => toggleGroup(`${section.label}-${item.label}`)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ease-in-out group",
                            itemHasActiveChild 
                              ? "bg-blue-50/80 border border-blue-200/50" 
                              : "hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {item.icon && (
                              <item.icon className={cn(
                                "w-4 h-4 flex-shrink-0 transition-colors",
                                itemHasActiveChild ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                              )} />
                            )}
                            <SidebarGroupLabel className={cn(
                              "text-sm font-semibold transition-colors truncate",
                              itemHasActiveChild ? "text-blue-700" : "text-gray-600 group-hover:text-gray-800"
                            )}>
                              {item.label}
                            </SidebarGroupLabel>
                          </div>
                          {item.items && item.items.length > 0 && (
                            <div className="flex-shrink-0 ml-2">
                              {isSubGroupOpen ? (
                                <ChevronUp className={cn(
                                  "w-3.5 h-3.5 transition-all duration-300",
                                  itemHasActiveChild ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                              ) : (
                                <ChevronDown className={cn(
                                  "w-3.5 h-3.5 transition-all duration-300",
                                  itemHasActiveChild ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                              )}
                            </div>
                          )}
                        </button>

                        {isSubGroupOpen && item.items && (
                          <SidebarGroupContent className="mt-1">
                            <SidebarMenu>
                              {item.items.map((subItem) => {
                                const isSubItemActive = isActiveLink(subItem.url);
                                
                                return (
                                  <SidebarMenuItem key={subItem.label}>
                                    <SidebarMenuButton
                                      asChild
                                      className={getButtonClasses(isSubItemActive, 2)}
                                    >
                                      <Link
                                        href={subItem.url || "#"}
                                        className="flex items-center gap-3 py-2.5 pl-10 pr-3"
                                      >
                                        <span className={cn(
                                          "truncate transition-colors",
                                          isSubItemActive ? "text-white font-medium" : "text-gray-700 hover:text-blue-700"
                                        )}>
                                          {subItem.label}
                                        </span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                );
                              })}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        )}
                      </SidebarGroup>
                    );
                  })}
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className={cn("p-4 border-t border-gray-200 bg-gradient-to-b from-transparent to-gray-50/30", isCollapsed ? 'flex items-center justify-center' : '')}>
        <div className={cn(isCollapsed ? 'flex justify-center' : 'w-full flex justify-center')}>
          <UserButton
            showName={!isCollapsed}
            userProfileMode="modal"
            appearance={{
              elements: {
                rootBox: "w-full flex items-center justify-center",
                userButtonBox: isCollapsed 
                  ? "flex items-center justify-center" 
                  : "w-full flex items-center justify-center gap-4",
                userButtonOuterIdentifier: isCollapsed 
                  ? "text-base font-medium text-gray-700 truncate"
                  : "text-lg font-medium text-gray-700 truncate",
                userButtonTrigger: isCollapsed
                  ? "p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                  : "w-full p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-4",
                userButtonAvatarBox: isCollapsed 
                  ? "w-11 h-11 flex-shrink-0 ring-2 ring-gray-200 ring-offset-2"
                  : "w-14 h-14 flex-shrink-0 ring-2 ring-gray-200 ring-offset-2",
              }
            }}
          />
            <ThemeToggleButton
              className="size-7 mx-2 pointer-events-auto "
              variant="circle"
              start="top-center"
              blur={true}
            />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SuperAdminDashboardSideBar;