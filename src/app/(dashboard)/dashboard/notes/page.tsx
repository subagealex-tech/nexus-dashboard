"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  StickyNote,
  ListTodo,
  Clock,
  TextQuote,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [showSidebar, setShowSidebar] = useState(true);

  const [newTodoText, setNewTodoText] = useState("");
  const [todoFilter, setTodoFilter] = useState<"all" | "active" | "completed">("all");

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const noteStats = useMemo(() => {
    const totalNotes = notes.length;
    const totalTodos = todos.length;
    const activeTodos = todos.filter((t) => !t.completed).length;
    const totalWords = notes.reduce((sum, n) => sum + (n.body?.split(/\s+/).filter(Boolean).length || 0), 0);
    return { totalNotes, totalTodos, activeTodos, totalWords };
  }, [notes, todos]);

  const saveNote = useCallback(() => {
    if (!selectedNoteId) return;
    setIsSaving(true);
    setTimeout(() => {
      updateNote(selectedNoteId, { title, body });
      setLastSaved(new Date());
      setIsSaving(false);
    }, 300);
  }, [selectedNoteId, title, body, updateNote]);

  useEffect(() => {
    if (!selectedNoteId || (!title && !body)) return;
    const timer = setTimeout(() => saveNote(), 2000);
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
  const completionPct = todos.length > 0 ? Math.round((completedTodosCount / todos.length) * 100) : 0;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);

  const formatDateFull = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    }).format(date);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            {activeTab === "notes" ? "Notes" : "Todos"}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {activeTab === "notes" ? "Write and organize your thoughts." : "Keep track of your tasks."}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#00f5d4]/10">
              <StickyNote className="w-[18px] h-[18px] text-[#00f5d4]" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Notes</p>
              <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{noteStats.totalNotes}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#9b5de5]/10">
              <ListTodo className="w-[18px] h-[18px] text-[#9b5de5]" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Todos</p>
              <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{noteStats.totalTodos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f15bb5]/10">
              <CheckSquare className="w-[18px] h-[18px] text-[#f15bb5]" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Active Todos</p>
              <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{noteStats.activeTodos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#fee440]/10">
              <TextQuote className="w-[18px] h-[18px] text-[#fee440]" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Words Written</p>
              <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{noteStats.totalWords.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setActiveTab("notes")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "notes"
              ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
              : "text-text-muted hover:text-text-primary hover:bg-glass-bg border border-transparent"
          )}
        >
          <StickyNote className="w-4 h-4" />
          Notes
        </button>
        <button onClick={() => setActiveTab("todos")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "todos"
              ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/30"
              : "text-text-muted hover:text-text-primary hover:bg-glass-bg border border-transparent"
          )}
        >
          <ListTodo className="w-4 h-4" />
          Todos
          {activeTodosCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-accent-purple/20 text-accent-purple rounded-full">
              {activeTodosCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "notes" ? (
        <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: showSidebar ? "300px 1fr" : "1fr" }}>
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-glass-border bg-bg-secondary/40 overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-glass-border space-y-3">
                  <Button onClick={createNote} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search notes..." value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 rounded-lg border border-glass-border bg-bg-tertiary pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[580px]">
                  {filteredNotes.length === 0 ? (
                    <div className="p-6 text-center text-text-muted">
                      <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">{searchQuery ? "No notes found" : "No notes yet"}</p>
                      <button onClick={createNote} className="text-xs text-accent-cyan hover:underline mt-1">
                        Create your first note
                      </button>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <motion.div key={note.id} layout
                        onClick={() => setSelectedNoteId(note.id)}
                        className={cn(
                          "group relative p-3 rounded-lg cursor-pointer transition-all border",
                          selectedNoteId === note.id
                            ? "bg-accent-cyan/8 border-accent-cyan/30"
                            : "border-transparent hover:border-glass-border hover:bg-glass-bg"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-text-primary truncate">
                              {note.title || "Untitled Note"}
                            </h3>
                            <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                              {note.body || "No content"}
                            </p>
                            <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(note.updatedAt)}
                            </p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {selectedNoteId === note.id && (
                          <motion.div layoutId="noteActive"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-cyan rounded-full"
                          />
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-xl border border-glass-border bg-bg-secondary/40 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {selectedNoteId ? (
                <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setShowSidebar(!showSidebar)}
                        className="p-1.5 rounded-md hover:bg-glass-bg transition-colors text-text-muted hover:text-text-primary"
                      >
                        {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{selectedNote ? formatDateFull(selectedNote.updatedAt) : ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastSaved && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-accent-cyan" />
                          Saved
                        </span>
                      )}
                      <Button variant="outline" size="sm" onClick={saveNote} disabled={isSaving}>
                        {isSaving ? (
                          <motion.div animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                          />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span className="ml-1.5 hidden sm:inline text-xs">Save</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-5 space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note Title"
                      className="w-full text-xl font-semibold bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted/50 font-[family-name:var(--font-outfit)]"
                    />
                    <textarea value={body} onChange={(e) => setBody(e.target.value)}
                      placeholder="Start writing..."
                      className="w-full min-h-[400px] resize-none bg-transparent border-none outline-none text-text-secondary placeholder:text-text-muted/30 leading-relaxed text-sm"
                    />
                  </div>
                  <div className="px-5 py-2 border-t border-glass-border flex items-center justify-between text-[10px] text-text-muted">
                    <span>{body.split(/\s+/).filter(Boolean).length} words</span>
                    <span>{body.length} characters</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mb-4">
                    <StickyNote className="w-7 h-7 text-accent-cyan" />
                  </div>
                  <h3 className="text-base font-medium text-text-primary mb-1">Select a note or create a new one</h3>
                  <p className="text-sm text-text-muted mb-4">Notes are auto-saved as you type.</p>
                  <Button onClick={createNote} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-glass-border bg-bg-secondary/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-glass-border space-y-3">
              <div className="flex gap-2">
                <input type="text" value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                  placeholder="Add a new todo..."
                  className="flex-1 h-10 rounded-lg border border-glass-border bg-bg-tertiary px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50"
                />
                <Button onClick={handleAddTodo} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              {todos.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{completionPct}% complete</span>
                    <span>{completedTodosCount}/{todos.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-glass-bg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 space-y-1 max-h-[500px] overflow-auto">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    {todoFilter === "all" ? "No todos yet. Add one above!" : `No ${todoFilter} todos`}
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <motion.div key={todo.id} layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all group",
                      todo.completed
                        ? "bg-accent-purple/5 border-accent-purple/20"
                        : "border-transparent hover:border-glass-border hover:bg-glass-bg"
                    )}
                  >
                    <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                      {todo.completed ? (
                        <CheckSquare className="w-5 h-5 text-accent-purple" />
                      ) : (
                        <Square className="w-5 h-5 text-text-muted group-hover:text-text-secondary transition-colors" />
                      )}
                    </button>
                    <span className={cn("flex-1 text-sm", todo.completed && "line-through text-text-muted")}>
                      {todo.text}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-text-primary mb-4">Filter</h3>
                <div className="space-y-1">
                  {([
                    { key: "all" as const, label: "All", color: "text-text-primary" },
                    { key: "active" as const, label: "Active", color: "text-accent-purple" },
                    { key: "completed" as const, label: "Completed", color: "text-text-primary" },
                  ]).map((opt) => (
                    <button key={opt.key} onClick={() => setTodoFilter(opt.key)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm",
                        todoFilter === opt.key
                          ? "bg-accent-purple/10 border border-accent-purple/30"
                          : "hover:bg-glass-bg border border-transparent"
                      )}
                    >
                      <span className={todoFilter === opt.key ? "text-accent-purple" : "text-text-secondary"}>{opt.label}</span>
                      <span className={cn("text-xs", opt.key === "active" ? "text-accent-purple" : "text-text-muted")}>
                        {opt.key === "all" ? todos.length : opt.key === "active" ? activeTodosCount : completedTodosCount}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {completedTodosCount > 0 && (
              <Card>
                <CardContent className="p-5">
                  <Button variant="outline" size="sm" onClick={clearCompletedTodos}
                    className="w-full gap-2 text-red-400 hover:text-red-400 border-red-500/20 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Completed ({completedTodosCount})
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
