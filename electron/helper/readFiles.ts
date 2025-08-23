import { ipcMain } from "electron";
import * as fs from "fs/promises";
import * as path from "path";

export type ProjectFile = {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
};

const readDirectoryRecursive = async (
  dirPath: string,
): Promise<ProjectFile[]> => {
  const files: ProjectFile[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      try {
        const stats = await fs.stat(fullPath);

        const projectFile: ProjectFile = {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: entry.isDirectory() ? undefined : stats.size,
          modified: stats.mtime,
        };

        // If it's a directory, recursively read its contents
        if (entry.isDirectory()) {
          const subFiles = await readDirectoryRecursive(fullPath);
          files.push(...subFiles);
        } else {
          files.push(projectFile);
        }
      } catch (statError) {
        // If we can't get stats for a specific file, still include basic info
        console.warn(`Could not get stats for ${fullPath}:`, statError);
        const projectFile: ProjectFile = {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
        };

        files.push(projectFile);

        // Even if we couldn't get stats, still try to read subdirectory if it's a directory
        if (entry.isDirectory()) {
          try {
            const subFiles = await readDirectoryRecursive(fullPath);
            files.push(...subFiles);
          } catch (subDirError) {
            console.warn(
              `Could not read subdirectory ${fullPath}:`,
              subDirError,
            );
          }
        }
      }
    }
  } catch (error) {
    console.error(`Failed to read directory ${dirPath}:`, error);
  }

  return files;
};

export const setupReadFilesIPCHandler = () => {
  ipcMain.handle(
    "readFiles:read-project-files",
    async (event, projectPath: string): Promise<ProjectFile[]> => {
      try {
        // Check if the project path exists
        await fs.access(projectPath);

        // Read all files recursively
        const files = await readDirectoryRecursive(projectPath);

        // Sort files: directories first, then alphabetically by name
        files.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });

        return files;
      } catch (error) {
        console.error(
          `Failed to read project files from ${projectPath}:`,
          error,
        );

        // Return empty array on error rather than throwing
        // This matches the error handling in your Zustand store
        return [];
      }
    },
  );
};
