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

export const searchFiles = (files: ProjectFile[], searchPattern: string) => {
  if (!searchPattern.trim()) return [];

  const pattern = searchPattern.trim();

  // Split pattern by spaces to handle multiple patterns
  const patterns = pattern.split(/\s+/).filter((p) => p.length > 0);

  // Separate inclusion and exclusion patterns
  const inclusionPatterns = patterns.filter((p) => !p.startsWith("!"));
  const exclusionPatterns = patterns
    .filter((p) => p.startsWith("!"))
    .map((p) => p.slice(1));

  let results = files;

  // Apply inclusion filters (if any)
  if (inclusionPatterns.length > 0) {
    results = files.filter((file) =>
      matchesAnyPattern(file, inclusionPatterns),
    );
  }

  // Apply exclusion filters
  if (exclusionPatterns.length > 0) {
    results = results.filter(
      (file) => !matchesAnyPattern(file, exclusionPatterns, true),
    );
  }

  // Sort results by relevance
  results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const searchLower =
      inclusionPatterns[0]?.toLowerCase() || pattern.toLowerCase();

    // Exact name matches first
    if (aName === searchLower && bName !== searchLower) return -1;
    if (bName === searchLower && aName !== searchLower) return 1;

    // Name starts with pattern
    const aStartsWith = aName.startsWith(searchLower);
    const bStartsWith = bName.startsWith(searchLower);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;

    // Name contains pattern
    const aNameContains = aName.includes(searchLower);
    const bNameContains = bName.includes(searchLower);
    if (aNameContains && !bNameContains) return -1;
    if (bNameContains && !aNameContains) return 1;

    // Alphabetical order as fallback
    return aName.localeCompare(bName);
  });

  return results;
};
