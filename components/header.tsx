"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { MoonIcon, SunIcon, Menu, X, FileText, CheckSquare, Kanban } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function Header() {
  const { address, disconnect } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const truncateAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 bg-white dark:bg-gray-950">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mr-2 md:hidden"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <Link href="/dashboard" className="text-xl font-bold">
            Spark
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </Button>

          <div className="hidden md:flex items-center space-x-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">{truncateAddress(address)}</div>
            <Button variant="outline" size="sm" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex flex-col space-y-4">
            <Link
              href="/dashboard/notes"
              className="flex items-center py-2 px-3 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText size={18} className="mr-2" />
              Notes
            </Link>
            <Link
              href="/dashboard/tasks"
              className="flex items-center py-2 px-3 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CheckSquare size={18} className="mr-2" />
              Tasks
            </Link>
            <Link
              href="/dashboard/kanban"
              className="flex items-center py-2 px-3 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Kanban size={18} className="mr-2" />
              Kanban Board
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-800 my-4 pt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Connected as: {truncateAddress(address)}
              </div>
              <Button variant="outline" onClick={() => disconnect()} className="w-full">
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
