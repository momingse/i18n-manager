import { app } from "electron";
import { mkdirSync } from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";

type DatabaseData = {
  storage: Record<string, string>;
};

const defaultData: DatabaseData = {
  storage: {},
};

let db: Low<DatabaseData>;

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

export const storeGetItem = async (key: string): Promise<string | null> => {
  try {
    await db.read();
    const value = db.data.storage[key];
    return value || null;
  } catch (error) {
    console.error("Error getting item from storage:", error);
    return null;
  }
};

export const storeSetItem = async (key: string, value: string): Promise<boolean> => {
  try {
    await db.read();
    db.data.storage[key] = value;
    await db.write();
    return true
  } catch (error) {
    console.error("Error setting item in storage:", error);
    return false
  }
};

export const storeRemoveItem = async (key: string): Promise<boolean> => {
  try {
    await db.read();
    delete db.data.storage[key];
    await db.write();
    return true;
  } catch (error) {
    console.error("Error removing item from storage:", error);
    return false
  }
};
