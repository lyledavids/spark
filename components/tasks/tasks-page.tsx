"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, CheckSquare, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getContractInstance, type Task } from "@/lib/contract"

// Contract address
const CONTRACT_ADDRESS = "0x5219015234d02F59B21A501fb52062f8bDF74E1A"

export function TasksPage() {
  const router = useRouter()
  const { isAuthenticated, isRegistered } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleToggleTask = async (task: Task) => {
    try {
      const contract = getContractInstance(CONTRACT_ADDRESS)
      await contract.updateTask(task.id, task.title, task.description, !task.completed, task.status)

      // Update the tasks list
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)))
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const contract = getContractInstance(CONTRACT_ADDRESS)
      await contract.deleteTask(id)

      // Update the tasks list
      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!isAuthenticated || !isRegistered) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">Manage your to-do lists</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/dashboard/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle
                        className={`text-lg font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(task.updatedAt * 1000).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              {task.description && (
                <CardContent className="pb-2">
                  <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.description}
                  </p>
                </CardContent>
              )}
              <CardFooter className="pt-2">
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{task.status}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Create your first task to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/dashboard/tasks/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
