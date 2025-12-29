"use client"

import { useState, useEffect } from "react"
import { Plus, Layout, ExternalLink, Trash2, Calendar, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { editorSheetsApi } from "@/lib/api"
import type { EditorSheet } from "@/types/editorSheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export function EditorSheetManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sheets, setSheets] = useState<EditorSheet[]>([])
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null)
  const [isAddingSheet, setIsAddingSheet] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newSheetName, setNewSheetName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [taskForm, setTaskForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    link: "",
  })

  useEffect(() => {
    if (user?.id) {
      fetchSheets()
    }
  }, [user?.id])

  const fetchSheets = async () => {
    try {
      setIsLoading(true)
      const response = await editorSheetsApi.getSheets(user!.id)
      if (response.success) {
        setSheets(response.sheets)
        if (response.sheets.length > 0 && !activeSheetId) {
          setActiveSheetId(response.sheets[0]._id)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching sheets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSheet = async () => {
    if (!newSheetName.trim() || !user) return

    try {
      const response = await editorSheetsApi.createSheet({
        employeeId: user.id,
        employeeName: user.name,
        sheetName: newSheetName,
      })

      if (response.success) {
        toast({ title: "Success", description: "New sheet created successfully" })
        setNewSheetName("")
        setIsAddingSheet(false)
        await fetchSheets()
        setActiveSheetId(response.sheet._id)
      } else {
        toast({ title: "Error", description: response.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create sheet", variant: "destructive" })
    }
  }

  const handleAddTask = async () => {
    if (!activeSheetId || !taskForm.title || !taskForm.link) return

    try {
      const response = await editorSheetsApi.addTask(activeSheetId, taskForm)
      if (response.success) {
        toast({ title: "Success", description: "Task added to sheet" })
        setTaskForm({
          date: new Date().toISOString().split("T")[0],
          title: "",
          link: "",
        })
        setIsAddingTask(false)
        await fetchSheets()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" })
    }
  }

  const handleDeleteTask = async (sheetId: string, taskId: string) => {
    try {
      const response = await editorSheetsApi.deleteTask(sheetId, taskId)
      if (response.success) {
        toast({ title: "Success", description: "Task deleted" })
        await fetchSheets()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-500" />
            Editor Sheets
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your daily editing tasks across multiple sheets</p>
        </div>

        <Dialog open={isAddingSheet} onOpenChange={setIsAddingSheet}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Sheet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sheet</DialogTitle>
              <DialogDescription>Add a new sheet to organize your daily editing work.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sheetName">Sheet Name</Label>
                <Input
                  id="sheetName"
                  placeholder="e.g., YouTube Content, Instagram Reels"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingSheet(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSheet} disabled={!newSheetName.trim()}>
                Create Sheet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sheets.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
              <Layout className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No sheets created yet</h3>
            <p className="text-slate-500 max-w-xs mb-6">
              Create your first sheet to start tracking your daily editing tasks.
            </p>
            <Button onClick={() => setIsAddingSheet(true)} variant="outline">
              Create My First Sheet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeSheetId || undefined} onValueChange={setActiveSheetId} className="w-full">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
              {sheets.map((sheet) => (
                <TabsTrigger key={sheet._id} value={sheet._id} className="gap-2">
                  <FileText className="w-4 h-4" />
                  {sheet.sheetName}
                </TabsTrigger>
              ))}
            </TabsList>

            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="ml-4 gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Daily Task</DialogTitle>
                  <DialogDescription>Add a new entry to your current sheet.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskDate">Date</Label>
                    <Input
                      id="taskDate"
                      type="date"
                      value={taskForm.date}
                      onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle">Task Title</Label>
                    <Input
                      id="taskTitle"
                      placeholder="What did you work on?"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskLink">Link (Drive/Folder)</Label>
                    <Input
                      id="taskLink"
                      placeholder="https://drive.google.com/..."
                      value={taskForm.link}
                      onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>Save Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {sheets.map((sheet) => (
            <TabsContent key={sheet._id} value={sheet._id} className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {sheet.sheetName} - Daily Tasks
                  </CardTitle>
                  <CardDescription>Track your work history for this sheet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900">
                        <TableRow>
                          <TableHead className="w-[150px]">Date</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Link</TableHead>
                          <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheet.tasks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                              No tasks added yet. Click "Add Task" to start.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sheet.tasks.map((task: any) => (
                            <TableRow key={task._id}>
                              <TableCell className="font-medium flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {task.date}
                              </TableCell>
                              <TableCell>{task.title}</TableCell>
                              <TableCell>
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  Open Link
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteTask(sheet._id, task._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
