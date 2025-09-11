import * as fs from "fs/promises";
import * as path from "path";
import { handleIPC, FileManagerIPCChannel } from ".";
import ignore from "ignore";

export type ProjectFile = {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
};

const loadGitIgnore = async (
  projectPath: string,
): Promise<ReturnType<typeof ignore> | null> => {
  try {
    const gitIgnorePath = path.join(projectPath, ".gitignore");
    const content = await fs.readFile(gitIgnorePath, "utf-8");
    return ignore().add(content.split("\n"));
  } catch {
    return null; // no .gitignore
  }
};

const readDirectoryRecursive = async (
  dirPath: string,
  rootPath: string,
  ig: ReturnType<typeof ignore> | null = null,
): Promise<ProjectFile[]> => {
  const files: ProjectFile[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      // Skip ignored files
      if (ig && ig.ignores(relativePath)) continue;

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

      if (isDirectory) {
        try {
          const subFiles = await readDirectoryRecursive(fullPath, rootPath);
          files.push(...subFiles);
        } catch (subDirError) {
          console.warn(`Could not read subdirectory ${fullPath}:`, subDirError);
        }
      } else {
        files.push(projectFile);
      }
    }
  } catch (error) {
    console.error(`Failed to read directory ${dirPath}:`, error);
  }

  return files;
};

export const setupFileManagerIPCHandler = () => {
  handleIPC(
    FileManagerIPCChannel.readProjectFiles,
    async (event, projectPath) => {
      try {
        await fs.access(projectPath);

        // Load .gitignore before reading
        const ig = await loadGitIgnore(projectPath);

        const files = await readDirectoryRecursive(
          projectPath,
          projectPath,
          ig,
        );

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
        return [];
      }
    },
  );

  handleIPC(FileManagerIPCChannel.readFileContent, async (event, filePath) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      console.error(`Failed to read file content from ${filePath}:`, error);
      return "";
    }
  });

  handleIPC(
    FileManagerIPCChannel.writeFileContent,
    async (event, filePath, content) => {
      try {
        await fs.writeFile(filePath, content);
        return true;
      } catch (error) {
        console.error(`Failed to write file content to ${filePath}:`, error);
        return false;
      }
    },
  );
};
