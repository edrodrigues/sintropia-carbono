"use client";

interface TopicTag {
  label: string;
  color?: "gray" | "blue" | "green" | "yellow" | "red" | "purple";
}

interface TopicTagsProps {
  tags: TopicTag[];
  maxVisible?: number;
}

const colorClasses: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export function TopicTags({ tags, maxVisible = 3 }: TopicTagsProps) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[tag.color || "gray"]}`}
        >
          {tag.label}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

export const commonTopicTags: TopicTag[] = [
  { label: "EU ETS", color: "blue" },
  { label: "Industrial", color: "green" },
  { label: "VCM", color: "purple" },
  { label: "Projections", color: "yellow" },
  { label: "Brazil", color: "green" },
  { label: "Policy", color: "red" },
  { label: "Carbon Market", color: "blue" },
  { label: "I-REC", color: "purple" },
  { label: "CBIO", color: "green" },
  { label: "Renewable Energy", color: "yellow" },
];
