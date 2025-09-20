import path from "path-browserify";
import { useEffect } from "react";
import { toast } from "sonner";
import { useConfirmStore } from "../confirmStore";
import { Project, useProjectStore } from "../project";

type ProjectStoreSubscribeState = {
  currentProjectId: string | undefined;
  fileLanguageMap: Project["fileLanguageMap"];
  data: Project["data"];
  translationPath: Project["i18nPath"];
  projectPath: Project["path"];
};

type FileComparision = {
  conflicts: boolean;
  fullPath: string;
  diskContent: string | null;
};

export const useProjectSubscriber = () => {
  const { addConfirmation } = useConfirmStore();
  const { updateDataByLanguage } = useProjectStore();

  useEffect(() => {
    const handler = async (
      state: ProjectStoreSubscribeState,
      prevState: ProjectStoreSubscribeState,
    ) => {
      if (
        !state.projectPath ||
        state.currentProjectId !== prevState.currentProjectId
      )
        return;

      const fileComparision: FileComparision[] = await Promise.all(
        state.fileLanguageMap.map(async (lang) => {
          const fullPath = path.join(state.translationPath, lang.filename);
          let fileContent: string | null = null;

          try {
            fileContent =
              await window.electronAPI.fileManager.readFileContent(fullPath);
          } catch (readError) {
            console.warn(`Failed to read backup for ${fullPath}:`, readError);
            toast.error(`Failed to read ${fullPath}`, {
              description:
                "File may not exist or could not be read. Please check the file and try again.",
            });
            return {
              conflicts: true,
              fullPath,
              diskContent: null,
            };
          }

          const prevLangData = prevState?.data?.[lang.language] ?? null;
          const prevContent = prevLangData
            ? JSON.stringify(prevLangData, null, 2)
            : null;

          const diskTrimmed = fileContent?.trim() ?? null;
          const prevTrimmed = prevContent?.trim() ?? null;

          return {
            conflicts: diskTrimmed !== prevTrimmed,
            fullPath,
            diskContent: diskTrimmed,
          };
        }),
      );

      if (fileComparision.some((c) => c.conflicts)) {
        const conflictLangs = state.fileLanguageMap.filter(
          (_, i) => fileComparision[i].conflicts,
        );

        addConfirmation({
          title: "File conflict",
          description: `The file(s) ${conflictLangs
            .map((lang) => lang.filename)
            .join(", ")} have changed. Do you want to overwrite them?`,
          actions: [
            {
              key: "overwrite",
              text: "Overwrite file",
              variant: "destructive",
              callbackFn: async () => {
                try {
                  for (const { fullPath } of fileComparision) {
                    const lang = conflictLangs.find(
                      (l) =>
                        path.join(state.translationPath, l.filename) ===
                        fullPath,
                    );
                    if (!lang) {
                      toast.error("Failed to overwrite file");
                      continue;
                    }

                    const newLangData = state.data?.[lang.language] ?? {};
                    const newContent = JSON.stringify(newLangData, null, 2);

                    await window.electronAPI.fileManager.writeFileContent(
                      fullPath,
                      newContent,
                    );
                  }
                } catch (error) {
                  console.error("Failed to overwrite file:", error);
                }
              },
            },
            {
              key: "restore",
              text: "Restore state",
              variant: "outline",
              callbackFn: () => {
                for (const { diskContent, fullPath } of fileComparision) {
                  const lang = conflictLangs.find(
                    (l) =>
                      path.join(state.translationPath, l.filename) === fullPath,
                  );
                  updateDataByLanguage(
                    lang?.language ?? "",
                    diskContent ? JSON.parse(diskContent) : {},
                  );
                }
              },
            },
            {
              key: "skip",
              text: "Skip",
              variant: "outline",
            },
          ],
        });
        return;
      }

      await Promise.all(
        state.fileLanguageMap.map(async (lang) => {
          const fullPath = path.join(state.translationPath, lang.filename);
          const newLangData = state.data?.[lang.language] ?? {};
          const newContent = JSON.stringify(newLangData, null, 2);
          try {
            await window.electronAPI.fileManager.writeFileContent(
              fullPath,
              newContent,
            );
          } catch (writeError) {
            console.error(`Failed to write ${fullPath}:`, writeError);
          }
        }),
      );
    };

    const unsub = useProjectStore.subscribe<ProjectStoreSubscribeState>(
      (state) => ({
        currentProjectId: state.currentProjectId,
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
      handler,
      {
        equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      },
    );

    return () => {
      unsub();
    };
  }, [addConfirmation, updateDataByLanguage]);
};
