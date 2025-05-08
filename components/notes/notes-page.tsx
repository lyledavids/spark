"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getContractInstance, type Note } from "@/lib/contract"

// Contract address
const CONTRACT_ADDRESS = "0x5219015234d02F59B21A501fb52062f8bDF74E1A"

export function NotesPage() {
  const router = useRouter()
  const { isAuthenticated, isRegistered } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated || !isRegistered) return

    const fetchNotes = async () => {
      try {
        setIsLoading(true)
        const contract = getContractInstance(CONTRACT_ADDRESS)

        const noteIds = await contract.getNoteIds()
        const notesPromises = noteIds.map((id) => contract.getNote(id))
        const notesData = await Promise.all(notesPromises)

        setNotes(notesData)
      } catch (error) {
        console.error("Error fetching notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [isAuthenticated, isRegistered])

  // Redirect if not authenticated or not registered
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (isAuthenticated && !isRegistered) {
      router.push("/")
    }
  }, [isAuthenticated, isRegistered, router])

  const handleDeleteNote = async (id: string) => {
    try {
      const contract = getContractInstance(CONTRACT_ADDRESS)
      await contract.deleteNote(id)

      // Update the notes list
      setNotes(notes.filter((note) => note.id !== id))
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!isAuthenticated || !isRegistered) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
        <p className="text-muted-foreground">Manage your notes and ideas</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/dashboard/notes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading notes...</p>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium truncate">{note.title}</CardTitle>
                <CardDescription className="text-xs">
                  {new Date(note.updatedAt * 1000).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-3">{note.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/notes/${note.id}`)}>
                  View
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Create your first note to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/dashboard/notes/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
