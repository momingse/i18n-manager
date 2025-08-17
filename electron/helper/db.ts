// main.ts or main/index.ts
import { app, ipcMain } from "electron";
import { mkdirSync } from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";

// Database schema
type DatabaseData = {
  storage: Record<string, string>;
};

// Default data
const defaultData: DatabaseData = {
  storage: {},
};

let db: Low<DatabaseData>;

// Initialize database
export const initDatabase = async () => {
  // Get user data directory
  const userDataPath = app.getPath("userData");
  const dbDir = join(userDataPath, "storage");

  // Ensure directory exists
  try {
    mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create storage directory:", error);
  }

  // Setup database
  const file = join(dbDir, "storage.json");
  const adapter = new JSONFile<DatabaseData>(file);
  db = new Low(adapter, defaultData);

  // Read data from JSON file, this will set db.data content
  await db.read();

  // If file doesn't exist, db.data will be null
  // Set default data and write to file
  if (db.data === null) {
    db.data = defaultData;
    await db.write();
  }
};

// IPC Handlers
export const setupIPCHandlers = () => {
  // Get item from storage
  ipcMain.handle(
    "storage:getItem",
    async (_, key: string): Promise<string | null> => {
      try {
        await db.read();
        const value = db.data.storage[key];
        return value || null;
      } catch (error) {
        console.error("Error getting item from storage:", error);
        return null;
      }
    },
  );

  // Set item in storage
  ipcMain.handle(
    "storage:setItem",
    async (_, key: string, value: string): Promise<boolean> => {
      try {
        await db.read();
        db.data.storage[key] = value;
        await db.write();
        return true;
      } catch (error) {
        console.error("Error setting item in storage:", error);
        return false;
      }
    },
  );

  // Remove item from storage
  ipcMain.handle(
    "storage:removeItem",
    async (_, key: string): Promise<boolean> => {
      try {
        await db.read();
        delete db.data.storage[key];
        await db.write();
        return true;
      } catch (error) {
        console.error("Error removing item from storage:", error);
        return false;
      }
    },
  );

  // Get all keys (useful for debugging)
  ipcMain.handle("storage:getAllKeys", async (): Promise<string[]> => {
    try {
      await db.read();
      return Object.keys(db.data.storage);
    } catch (error) {
      console.error("Error getting all keys from storage:", error);
      return [];
    }
  });

  // Clear all storage (useful for debugging)
  ipcMain.handle("storage:clear", async (): Promise<boolean> => {
    try {
      await db.read();
      db.data.storage = {};
      await db.write();
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  });
};
