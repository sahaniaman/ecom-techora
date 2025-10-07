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
            url: "/superadmin/management/products/view",
          },
          {
            label: "Add Products",
            url: "/superadmin/management/products/add",
          },
        ],
      },
    ],
  },
];

const SuperAdminDashboardSideBar = () => {
  const {state} = useSidebar()
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

  return (
    <Sidebar className="border-r border-gray-200" collapsible="icon">
      <SidebarContent className="px-2 py-4">
        {sections.map((section) => {
          // If section has a direct URL, render as simple button
          if (section.url) {
            return (
              <SidebarMenu key={section.label}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-base font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-xl transition-all duration-300 ease-in-out hover:shadow-sm active:scale-[0.98] my-1"
                  >
                    <Link
                      href={section.url}
                      className="flex items-center gap-3 py-3 px-3"
                    >
                      {section.icon && <section.icon className="w-5 h-5 flex-shrink-0" />}
                      <span className="truncate">{section.label}</span>
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
            const isOpen = isGroupOpen(section.label);

            return (
              <SidebarGroup
                key={section.label}
                className="border-b border-gray-100/50 last:border-b-0 pb-3 mb-3"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(section.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all duration-300 ease-in-out group ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'flex-1'}`}>
                    {section.icon && (
                      <section.icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors" />
                    )}
                    {!isCollapsed && (
                      <SidebarGroupLabel className="text-xs font-bold text-gray-600 uppercase tracking-wider group-hover:text-gray-800 transition-colors">
                        {section.label}
                      </SidebarGroupLabel>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-shrink-0 ml-2">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-300" />
                      )}
                    </div>
                  )}
                </button>

                {isOpen && !isCollapsed && (
                  <SidebarGroupContent className="mt-1">
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            asChild
                            className="text-sm hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 active:scale-[0.98] my-0.5"
                          >
                            <Link
                              href={item.url || "#"}
                              className="flex items-center gap-3 py-2.5 pl-8 pr-3"
                            >
                              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0 text-gray-500" />}
                              <span className="text-gray-700 truncate">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          }

          // If section has nested items (multi-level), render as collapsible
          const isOpen = isGroupOpen(section.label);

          return (
            <SidebarGroup
              key={section.label}
              className="border-b border-gray-100/50 last:border-b-0 pb-3 mb-3"
            >
              <button
                type="button"
                onClick={() => toggleGroup(section.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all duration-300 ease-in-out group ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'flex-1'}`}>
                  {section.icon && (
                    <section.icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  )}
                  {!isCollapsed && (
                    <SidebarGroupLabel className="text-xs font-bold text-gray-600 uppercase tracking-wider group-hover:text-gray-800 transition-colors">
                      {section.label}
                    </SidebarGroupLabel>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-shrink-0 ml-2">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-300" />
                    )}
                  </div>
                )}
              </button>

              {isOpen && !isCollapsed && (
                <SidebarGroupContent className="mt-1">
                  {section.items?.map((item) => {
                    const isSubGroupOpen = isGroupOpen(
                      `${section.label}-${item.label}`,
                    );

                    return (
                      <SidebarGroup key={item.label} className="ml-2">
                        <button
                          type="button"
                          onClick={() =>
                            toggleGroup(`${section.label}-${item.label}`)
                          }
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out group"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {item.icon && (
                              <item.icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors" />
                            )}
                            <SidebarGroupLabel className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors truncate">
                              {item.label}
                            </SidebarGroupLabel>
                          </div>
                          {item.items && item.items.length > 0 && (
                            <div className="flex-shrink-0 ml-2">
                              {isSubGroupOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-all duration-300" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-all duration-300" />
                              )}
                            </div>
                          )}
                        </button>

                        {isSubGroupOpen && item.items && (
                          <SidebarGroupContent className="mt-1">
                            <SidebarMenu>
                              {item.items.map((subItem) => (
                                <SidebarMenuItem key={subItem.label}>
                                  <SidebarMenuButton
                                    asChild
                                    className="text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 active:scale-[0.98] my-0.5"
                                  >
                                    <Link
                                      href={subItem.url || "#"}
                                      className="flex items-center gap-3 py-2.5 pl-10 pr-3"
                                    >
                                      <span className="text-gray-700 hover:text-blue-700 transition-colors truncate">
                                        {subItem.label}
                                      </span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
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
      <SidebarFooter className={`p-4 border-t border-gray-200 bg-gradient-to-b from-transparent to-gray-50/30 ${isCollapsed ? 'flex items-center justify-center' : ''}`}>
        <div className={`${isCollapsed ? 'flex justify-center' : 'w-full flex justify-center'}`}>
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
          },
        }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SuperAdminDashboardSideBar;