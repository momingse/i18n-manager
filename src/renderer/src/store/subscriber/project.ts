import { useEffect } from "react";
import { Project, useProjectStore } from "../project";
import path from "path-browserify";
import { toast } from "sonner";
import { debounce } from "@/lib/debounce";

type ProjectStoreSubscribeState = {
  fileLanguageMap: Project["fileLanguageMap"];
  data: Project["data"];
  translationPath: Project["i18nPath"];
  projectPath: Project["path"];
};

export const useProjectSubscriber = () => {
  useEffect(() => {
    const handler = async (
      state: ProjectStoreSubscribeState,
      prevState: ProjectStoreSubscribeState,
    ) => {
      if (!state.projectPath) return;

      await Promise.all(
        state.fileLanguageMap.map(async (lang) => {
          const fullPath = path.join(state.translationPath, lang.filename);
          let fileContent: string | null = null;

          try {
            fileContent =
              await window.electronAPI.fileManager.readFileContent(fullPath);
          } catch (readError) {
            // If file doesn't exist, treat backup as null (behavior kept from original)
            console.warn(`Failed to read backup for ${fullPath}:`, readError);
            toast.error(`Failed to read ${fullPath}`, {
              description:
                "File may not exist or could not be read. Please check the file and try again.",
            });
            return;
          }

          // Prepare previous store snapshot content (stringified)
          const prevLangData =
            prevState && prevState.data && prevState.data[lang.language]
              ? prevState.data[lang.language]
              : null;
          const prevContent = prevLangData
            ? JSON.stringify(prevLangData, null, 2)
            : null;

          // If the on-disk backup differs from the previous store snapshot -> conflict.
          // Note: we compare strings. diskBackup may have different whitespace; trim both sides.
          const diskTrimmed = fileContent ? fileContent.trim() : null;
          const prevTrimmed = prevContent ? prevContent.trim() : null;

          if (diskTrimmed !== prevTrimmed) {
            // TODO: notify user of conflict
            console.error(`Conflict detected for ${fullPath}:`);
            return;
          }

          // Prepare new content we'll want to write
          const newLangData =
            state && state.data && state.data[lang.language]
              ? state.data[lang.language]
              : {};
          const newContent = JSON.stringify(newLangData, null, 2);

          // If no conflict (or solver allowed overwrite) then write new data
          try {
            await window.electronAPI.fileManager.writeFileContent(
              fullPath,
              newContent,
            );
          } catch (writeError) {
            console.error(`Failed to write ${fullPath}:`, writeError);
            if (fileContent !== null) {
              try {
                // Restore backup on failure
                await window.electronAPI.fileManager.writeFileContent(
                  fullPath,
                  fileContent,
                );
                console.log(`Restored backup for ${fullPath}`);
                toast.error(`Failed to write ${fullPath}, restored backup`);
              } catch (restoreError) {
                console.error(
                  `Failed to restore backup for ${fullPath}:`,
                  restoreError,
                );
                toast.error(
                  `Failed to write ${fullPath}, failed to restore backup`,
                );
              }
            }
          }
        }),
      );
    };

    const debouncedHandler = debounce(handler);

    const unsub = useProjectStore.subscribe<ProjectStoreSubscribeState>(
      (state) => ({
        fileLanguageMap: state.currentProjectId
          ? state.projects[state.currentProjectId].fileLanguageMap
          : [],
        data: state.currentProjectId
          ? state.projects[state.currentProjectId].data
          : {},
        projectPath: state.currentProjectId
          ? state.projects[state.currentProjectId].path
          : "",
        translationPath: state.currentProjectId
          ? state.projects[state.currentProjectId].i18nPath
          : "",
      }),
      // Zustand provides both current selected slice and previous selected slice as args
      (state, prevState) => {
        debouncedHandler(state, prevState);
      },
      {
        equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      },
    );

    return () => {
      unsub();
    };
  }, []);
};
