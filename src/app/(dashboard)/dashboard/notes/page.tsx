"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  FileText,
  Save,
  CheckCircle,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotes } from "@/components/providers/NotesContext";

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<"notes" | "todos">("notes");
  
  const { notes, todos, addNote, updateNote, deleteNote, addTodo, toggleTodo, deleteTodo, clearCompletedTodos } = useNotes();
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [newTodoText, setNewTodoText] = useState("");
  const [todoFilter, setTodoFilter] = useState<"all" | "active" | "completed">("all");

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const saveNote = useCallback(() => {
    if (!selectedNoteId) return;

    setIsSaving(true);
    setTimeout(() => {
      updateNote(selectedNoteId, { title, body });
      setLastSaved(new Date());
      setIsSaving(false);
    }, 500);
  }, [selectedNoteId, title, body, updateNote]);

  useEffect(() => {
    if (!selectedNoteId || (!title && !body)) return;

    const timer = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, body, selectedNoteId, saveNote]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setBody(selectedNote.body);
    } else {
      setTitle("");
      setBody("");
    }
  }, [selectedNoteId, selectedNote]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      body: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addNote(newNote);
    setSelectedNoteId(newNote.id);
    setTitle("Untitled Note");
    setBody("");
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setTitle("");
      setBody("");
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date(),
    };
    addTodo(newTodo);
    setNewTodoText("");
  };

  const filteredTodos = todos.filter((todo) => {
    if (todoFilter === "active") return !todo.completed;
    if (todoFilter === "completed") return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter((t) => !t.completed).length;
  const completedTodosCount = todos.filter((t) => t.completed).length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Notes & Todos
        </h1>
        <p className="text-text-secondary mt-1">
          Create notes and manage your tasks in one place.
        </p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("notes")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "notes"
              ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
              : "text-text-secondary hover:text-text-primary hover:bg-glass-bg"
          )}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Notes
        </button>
        <button
          onClick={() => setActiveTab("todos")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "todos"
              ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
              : "text-text-secondary hover:text-text-primary hover:bg-glass-bg"
          )}
        >
          <CheckSquare className="w-4 h-4 inline-block mr-2" />
          Todos
          {activeTodosCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-full">
              {activeTodosCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "notes" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-h-[500px] md:min-h-[600px]">
          <div className="rounded-xl border border-glass-border bg-card-bg md:col-span-1 flex flex-col">
            <div className="p-4 border-b border-glass-border">
              <Button onClick={createNote} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create New Note
              </Button>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-lg border border-glass-border bg-bg-secondary pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredNotes.length === 0 ? (
                <div className="p-4 text-center text-text-muted text-sm">
                  {searchQuery ? "No notes found" : "No notes yet. Create one!"}
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={cn(
                      "group relative p-3 rounded-lg cursor-pointer transition-all",
                      selectedNoteId === note.id
                        ? "bg-accent-cyan/10 border border-accent-cyan/30"
                        : "hover:bg-glass-bg border border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary truncate">
                          {note.title || "Untitled Note"}
                        </h3>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">
                          {note.body || "No content"}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedNoteId === note.id && (
                      <motion.div
                        layoutId="activeNote"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-cyan rounded-r-full"
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-glass-border bg-card-bg md:col-span-3 flex flex-col">
            <AnimatePresence mode="wait">
              {selectedNoteId ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center justify-between p-4 border-b border-glass-border">
                    <div className="flex items-center gap-2 text-text-muted">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedNote?.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastSaved && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-accent-cyan" />
                          Saved
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveNote}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                          />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Save</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 md:p-6 space-y-4">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note Title"
                      className="w-full text-xl md:text-2xl font-bold bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted"
                    />
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Start writing your note..."
                      className="w-full flex-1 min-h-[300px] md:min-h-[400px] resize-none bg-transparent border-none outline-none text-text-secondary placeholder:text-text-muted leading-relaxed"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-accent-cyan" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Select a note or create a new one
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Your notes are automatically saved as you type.
                  </p>
                  <Button onClick={createNote} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Note
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-xl border border-glass-border bg-card-bg md:col-span-2">
            <div className="p-4 border-b border-glass-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                  placeholder="Add a new todo..."
                  className="flex-1 h-10 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary placeholder:text-text-muted"
                />
                <Button onClick={handleAddTodo} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  {todoFilter === "all" ? "No todos yet. Add one above!" : `No ${todoFilter} todos`}
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      todo.completed
                        ? "bg-accent-cyan/5 border-accent-cyan/20"
                        : "bg-glass-bg border-transparent hover:border-glass-border"
                    )}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckSquare className="w-5 h-5 text-accent-cyan" />
                      ) : (
                        <Square className="w-5 h-5 text-text-muted" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1",
                        todo.completed && "line-through text-text-muted"
                      )}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-glass-border bg-card-bg">
            <div className="p-4 border-b border-glass-border">
              <h3 className="font-medium text-text-primary">Filters</h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => setTodoFilter("all")}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  todoFilter === "all"
                    ? "bg-accent-cyan/10 border border-accent-cyan/30"
                    : "hover:bg-glass-bg"
                )}
              >
                <span className="text-sm text-text-primary">All</span>
                <span className="text-sm text-text-muted">{todos.length}</span>
              </button>
              <button
                onClick={() => setTodoFilter("active")}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  todoFilter === "active"
                    ? "bg-accent-cyan/10 border border-accent-cyan/30"
                    : "hover:bg-glass-bg"
                )}
              >
                <span className="text-sm text-text-primary">Active</span>
                <span className="text-sm text-accent-cyan">{activeTodosCount}</span>
              </button>
              <button
                onClick={() => setTodoFilter("completed")}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  todoFilter === "completed"
                    ? "bg-accent-cyan/10 border border-accent-cyan/30"
                    : "hover:bg-glass-bg"
                )}
              >
                <span className="text-sm text-text-primary">Completed</span>
                <span className="text-sm text-text-muted">{completedTodosCount}</span>
              </button>
            </div>
            {completedTodosCount > 0 && (
              <div className="p-4 border-t border-glass-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompletedTodos}
                  className="w-full text-red-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Completed
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}