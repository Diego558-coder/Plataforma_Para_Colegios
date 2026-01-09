import fs from 'fs';
import path from 'path';

type Content = {
  id: string;
  title: string;
  description?: string;
  scope: 'course' | 'global';
  status: 'draft' | 'published' | 'pendingApproval' | 'approved' | 'rejected';
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  status: 'draft' | 'published' | 'closed';
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

type DB = {
  contents: Content[];
  tasks: Task[];
};

const filePath = path.join(process.cwd(), 'data-store.json');

function readDB(): DB {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { contents: [], tasks: [] };
  }
}

function writeDB(db: DB) {
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const DataStore = {
  listContents(filter: Partial<Pick<Content, 'scope' | 'status' | 'authorId'>> = {}) {
    const db = readDB();
    return db.contents.filter((c) => {
      for (const k of Object.keys(filter)) {
        const key = k as keyof typeof filter;
        if ((filter as any)[key] !== undefined && (c as any)[key] !== (filter as any)[key]) return false;
      }
      return true;
    });
  },
  createContent(input: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) {
    const db = readDB();
    const now = new Date().toISOString();
    const item: Content = { id: uid(), ...input, createdAt: now, updatedAt: now };
    db.contents.push(item);
    writeDB(db);
    return item;
  },
  updateContent(id: string, patch: Partial<Content>) {
    const db = readDB();
    const idx = db.contents.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.contents[idx] = { ...db.contents[idx], ...patch, updatedAt: new Date().toISOString() };
    writeDB(db);
    return db.contents[idx];
  },
  deleteContent(id: string) {
    const db = readDB();
    db.contents = db.contents.filter((c) => c.id !== id);
    writeDB(db);
  },

  listTasks(filter: Partial<Pick<Task, 'status' | 'authorId'>> = {}) {
    const db = readDB();
    return db.tasks.filter((t) => {
      for (const k of Object.keys(filter)) {
        const key = k as keyof typeof filter;
        if ((filter as any)[key] !== undefined && (t as any)[key] !== (filter as any)[key]) return false;
      }
      return true;
    });
  },
  createTask(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const db = readDB();
    const now = new Date().toISOString();
    const item: Task = { id: uid(), ...input, createdAt: now, updatedAt: now };
    db.tasks.push(item);
    writeDB(db);
    return item;
  },
  updateTask(id: string, patch: Partial<Task>) {
    const db = readDB();
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    db.tasks[idx] = { ...db.tasks[idx], ...patch, updatedAt: new Date().toISOString() };
    writeDB(db);
    return db.tasks[idx];
  },
  deleteTask(id: string) {
    const db = readDB();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    writeDB(db);
  }
};

export type { Content, Task };