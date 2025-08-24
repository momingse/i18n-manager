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
      const isDirectory = entry.isDirectory();
      let projectFile: ProjectFile;

      try {
        const stats = await fs.stat(fullPath);
        projectFile = {
          name: entry.name,
          path: fullPath,
          isDirectory,
          size: isDirectory ? undefined : stats.size,
          modified: stats.mtime,
        };
      } catch (statError) {
        console.warn(`Could not get stats for ${fullPath}:`, statError);
        projectFile = {
          name: entry.name,
          path: fullPath,
          isDirectory,
        };
      }

      files.push(projectFile);

      if (isDirectory) {
        try {
          const subFiles = await readDirectoryRecursive(fullPath);
          files.push(...subFiles);
        } catch (subDirError) {
          console.warn(`Could not read subdirectory ${fullPath}:`, subDirError);
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

  ipcMain.handle(
    "readFiles:read-file-content",
    async (event, filePath: string): Promise<string | null> => {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        return content;
      } catch (error) {
        console.error(`Failed to read file content from ${filePath}:`, error);
        return null;
      }
    },
  );
};
