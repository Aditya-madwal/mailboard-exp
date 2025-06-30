"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Link,
  Clock,
  User,
  MoreHorizontal,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { useMail } from "@/context/mailContext";
import { getAllTasks, updateTask, deleteTask } from "@/services/api/todo";

const columns = [
  { id: "To Do", title: "To Do", color: "border-gray-500" },
  { id: "In Progress", title: "In Progress", color: "border-blue-500" },
  { id: "Review", title: "Review", color: "border-yellow-500" },
  { id: "Done", title: "Done", color: "border-green-500" },
];

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function TodoKanban() {
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { tasks, setTasks } = useMail();

  const fetchTasks = async () => {
    const fetchedTasks = await getAllTasks();
    setTasks(fetchedTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleReadMore = (todo) => {
    setSelectedTodo(todo);
    setDetailDialogOpen(true);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const updated = await updateTask(taskId, { status: newStatus });
    if (updated) {
      fetchTasks();
    }
  };

  const updateTaskPriority = async (taskId, newPriority) => {
    const updated = await updateTask(taskId, { priority: newPriority });
    if (updated) {
      fetchTasks();
    }
  };
  const delete_Task = async (taskId) => {
    // alert("djbwedjb")
    const deleted = await deleteTask(taskId);
    if (deleted) {
      fetchTasks();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Todo Board</h1>
        </div>
        <Button onClick={() => setAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col w-80 flex-shrink-0 h-full">
              <div
                className={`border-t-4 ${column.color} bg-card rounded-t-lg p-4 flex-shrink-0`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary">
                    {tasks.filter((todo) => todo.status === column.id).length}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 bg-muted/20 rounded-b-lg p-2 overflow-y-auto min-h-0">
                <div className="space-y-3">
                  {tasks
                    .filter((todo) => todo?.status === column.id)
                    .map((todo) => (
                      <Card
                        key={todo?.id}
                        className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-medium leading-tight">
                              {todo?.title}
                            </CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive hover:bg-red-300 hover:text-red-500 cursor-pointer"
                                  onClick={() => delete_Task(todo._id)}>
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateTaskStatus(todo._id, "To Do")
                                  }>
                                  Move to To Do
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateTaskStatus(todo._id, "In Progress")
                                  }>
                                  Move to In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateTaskStatus(todo._id, "Review")
                                  }>
                                  Move to Review
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateTaskStatus(todo._id, "Done")
                                  }>
                                  Move to Done
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-3">
                            {todo.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {todo.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    className={`text-xs cursor-pointer ${priorityColors[
                                      todo.priority.toLowerCase()
                                    ]
                                      }`}>
                                    {todo.priority}{" "}
                                    <ChevronDown className="h-3 w-3 ml-1 inline" />
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateTaskPriority(todo._id, "High")
                                    }>
                                    High
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateTaskPriority(todo._id, "Medium")
                                    }>
                                    Medium
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateTaskPriority(todo._id, "Low")
                                    }>
                                    Low
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => handleReadMore(todo)}>
                              <Eye className="h-3 w-3" />
                              Read more
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedTodo?.title}</DialogTitle>
          </DialogHeader>

          {selectedTodo && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTodo.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Priority</h3>
                  <Badge
                    className={
                      priorityColors[selectedTodo.priority.toLowerCase()]
                    }>
                    {selectedTodo.priority}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant="outline">{selectedTodo.status}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Due Date</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {selectedTodo.dueDate
                      ? formatDate(selectedTodo.dueDate)
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(selectedTodo.createdAt)}
                  </div>
                </div>
              </div>

              {selectedTodo.tags?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTodo.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTodo.relatedLinks?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Related Links</h3>
                  <div className="space-y-2">
                    {selectedTodo.relatedLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all">
                          {link}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} />
    </div>
  );
}
