"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, CheckSquare, Kanban, Plus, ChevronDown, ChevronRight } from "lucide-react"

type SidebarItem = {
  title: string
  icon: React.ReactNode
  href: string
  items?: { title: string; href: string }[]
}

export function Sidebar() {
  const pathname = usePathname()
  // Always show sidebar
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    notes: true,
    tasks: true,
  })

  const sidebarItems: SidebarItem[] = [
    {
      title: "Notes",
      icon: <FileText size={18} />,
      href: "/dashboard/notes",
      items: [
        { title: "All Notes", href: "/dashboard/notes" },
        { title: "Create Note", href: "/dashboard/notes/new" },
      ],
    },
    {
      title: "Tasks",
      icon: <CheckSquare size={18} />,
      href: "/dashboard/tasks",
      items: [
        { title: "To-Do Lists", href: "/dashboard/tasks" },
        { title: "Create Task", href: "/dashboard/tasks/new" },
      ],
    },
    {
      title: "Kanban Board",
      icon: <Kanban size={18} />,
      href: "/dashboard/kanban",
    },
  ]

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="hidden md:block md:w-64 md:flex-shrink-0 h-screen fixed left-0 top-0 bottom-0 z-10">
      <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h2 className="text-lg font-semibold">Spark</h2>
          </div>
          <ScrollArea className="flex-1 px-3">
            <nav className="flex-1 space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="py-1">
                  {item.items ? (
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => toggleExpanded(item.title.toLowerCase())}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                          {expanded[item.title.toLowerCase()] ? (
                            <ChevronDown size={16} className="ml-auto" />
                          ) : (
                            <ChevronRight size={16} className="ml-auto" />
                          )}
                        </div>
                      </Button>
                      {expanded[item.title.toLowerCase()] && (
                        <div className="mt-1 pl-8 space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              className={cn(
                                "block py-2 px-3 text-sm rounded-md",
                                pathname === subItem.href
                                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                              )}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center py-2 px-3 text-sm rounded-md",
                        pathname === item.href
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                      )}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <Button className="w-full" onClick={() => {}}>
            <Plus size={16} className="mr-2" />
            New Item
          </Button>
        </div>
      </div>
    </div>
  )
}
