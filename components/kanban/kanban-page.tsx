"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ArrowLeft, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getContractInstance, type Task } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"

// Contract address
const CONTRACT_ADDRESS = "0x5219015234d02F59B21A501fb52062f8bDF74E1A"

export function KanbanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isRegistered } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !isRegistered) return

    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const contract = getContractInstance(CONTRACT_ADDRESS)

        const taskIds = await contract.getTaskIds()
        const tasksPromises = taskIds.map((id) => contract.getTask(id))
        const tasksData = await Promise.all(tasksPromises)

        setTasks(tasksData)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [isAuthenticated, isRegistered])

  // Redirect if not authenticated or not registered
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (isAuthenticated && !isRegistered) {
      router.push("/")
    }
  }, [isAuthenticated, isRegistered, router])

  const handleMoveTask = async (task: Task, newStatus: "todo" | "in-progress" | "done") => {
    try {
      const contract = getContractInstance(CONTRACT_ADDRESS)
      await contract.updateTask(task.id, task.title, task.description, task.completed, newStatus)

      // Update the tasks list
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))

      toast({
        title: "Task moved",
        description: `Task moved to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error moving task:", error)
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const contract = getContractInstance(CONTRACT_ADDRESS)
      await contract.deleteTask(id)

      // Update the tasks list
      setTasks(tasks.filter((task) => task.id !== id))

      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  if (!isAuthenticated || !isRegistered) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Button onClick={() => router.push("/dashboard/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <p className="text-muted-foreground">Manage your tasks visually</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <h3 className="font-medium">To Do</h3>
            </div>
            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <Card key={task.id} className="cursor-move">
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  {task.description && (
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </CardContent>
                  )}
                  <div className="p-3 pt-0 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleMoveTask(task, "in-progress")}
                    >
                      Move to In Progress
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-md">
              <h3 className="font-medium">In Progress</h3>
            </div>
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => (
                <Card key={task.id} className="cursor-move">
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  {task.description && (
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </CardContent>
                  )}
                  <div className="p-3 pt-0 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleMoveTask(task, "todo")}
                    >
                      Move to To Do
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleMoveTask(task, "done")}
                    >
                      Move to Done
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md">
              <h3 className="font-medium">Done</h3>
            </div>
            {doneTasks.length > 0 ? (
              doneTasks.map((task) => (
                <Card key={task.id} className="cursor-move">
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  {task.description && (
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </CardContent>
                  )}
                  <div className="p-3 pt-0 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleMoveTask(task, "in-progress")}
                    >
                      Move to In Progress
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
