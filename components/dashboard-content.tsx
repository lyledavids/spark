"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { FileText, CheckSquare, Kanban, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getContractInstance } from "@/lib/contract"
import { EnvCheck } from "@/components/env-check"
import { ApiTest } from "@/components/api-test"
import { ApiKeyDebug } from "@/components/api-key-debug"

// Contract address
const CONTRACT_ADDRESS = "0x5219015234d02F59B21A501fb52062f8bDF74E1A"

export function DashboardContent() {
  const router = useRouter()
  const { address, isAuthenticated, isRegistered } = useAuth()
  const [noteCount, setNoteCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !isRegistered) return

    const fetchCounts = async () => {
      try {
        setIsLoading(true)
        const contract = getContractInstance(CONTRACT_ADDRESS)

        const noteIds = await contract.getNoteIds()
        const taskIds = await contract.getTaskIds()

        setNoteCount(noteIds.length)
        setTaskCount(taskIds.length)
      } catch (error) {
        console.error("Error fetching counts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCounts()
  }, [isAuthenticated, isRegistered])

  // Redirect if not authenticated or not registered
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (isAuthenticated && !isRegistered) {
      router.push("/")
    }
  }, [isAuthenticated, isRegistered, router])

  if (!isAuthenticated || !isRegistered) {
    return null
  }

  return (
    <div className="space-y-6">
      <EnvCheck />
      <ApiTest />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? "Hide Debug Tools" : "Show Debug Tools"}
        </Button>
      </div>

      {showDebug && <ApiKeyDebug />}

      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your Spark dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : noteCount}</div>
            <p className="text-xs text-muted-foreground">Total notes created</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => router.push("/dashboard/notes/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : taskCount}</div>
            <p className="text-xs text-muted-foreground">Total tasks created</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => router.push("/dashboard/tasks/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kanban Board</CardTitle>
            <Kanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Organize</div>
            <p className="text-xs text-muted-foreground">Manage your tasks visually</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => router.push("/dashboard/kanban")}
            >
              <Plus className="mr-2 h-4 w-4" />
              View Board
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>Your recently created or updated notes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading notes...</p>
            ) : noteCount > 0 ? (
              <p>Your notes will appear here</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notes yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first note to get started</p>
                <Button onClick={() => router.push("/dashboard/notes/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your recently created or updated tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : taskCount > 0 ? (
              <p>Your tasks will appear here</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No tasks yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first task to get started</p>
                <Button onClick={() => router.push("/dashboard/tasks/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
