import { ProjectFile } from "@/store/project";

// Helper function to convert glob pattern to regex
const globToRegex = (glob: string) => {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars except * and ?
    .replace(/\*/g, ".*") // Convert * to .*
    .replace(/\?/g, "."); // Convert ? to .
  return new RegExp(`^${escaped}$`, "i");
};

export const matchesAnyPattern = (
  file: ProjectFile,
  patterns: string[],
  isExclusion: boolean = false,
) => {
  return patterns.some((pattern) => {
    // Handle glob patterns (contains * or ?)
    if (pattern.includes("*") || pattern.includes("?")) {
      const regex = globToRegex(pattern);
      return regex.test(file.path) || regex.test(file.name);
    }

    // Handle exact matches and substring matches
    const lowerPattern = pattern.toLowerCase();
    const lowerName = file.name.toLowerCase();
    const lowerPath = file.path.toLowerCase();

    // For exclusion patterns, be more strict (exact extension match)
    if (isExclusion && pattern.startsWith(".")) {
      return (
        lowerName.endsWith(lowerPattern) || lowerPath.endsWith(lowerPattern)
      );
    }

    // Priority order: exact name match, name contains, path contains
    return (
      lowerName === lowerPattern ||
      lowerName.includes(lowerPattern) ||
      lowerPath.includes(lowerPattern)
    );
  });
};
