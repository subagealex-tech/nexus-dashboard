"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface NotesContextType {
  notes: Note[];
  todos: Todo[];
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompletedTodos: () => void;
}

const NOTES_KEY = "nexus-notes";
const TODOS_KEY = "nexus-todos";

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const storedNotes = localStorage.getItem(NOTES_KEY);
    if (storedNotes) {
      try {
        const parsed = JSON.parse(storedNotes);
        setNotes(
          parsed.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }))
        );
      } catch {
        setNotes([]);
      }
    }

    const storedTodos = localStorage.getItem(TODOS_KEY);
    if (storedTodos) {
      try {
        const parsed = JSON.parse(storedTodos);
        setTodos(
          parsed.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
          }))
        );
      } catch {
        setTodos([]);
      }
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0 || notes.length === 0) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  }, [todos]);

  const addNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const updateNote = (id: string, noteData: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...noteData, updatedAt: new Date() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const addTodo = (todo: Todo) => {
    setTodos((prev) => [todo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompletedTodos = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        todos,
        addNote,
        updateNote,
        deleteNote,
        addTodo,
        toggleTodo,
        deleteTodo,
        clearCompletedTodos,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}