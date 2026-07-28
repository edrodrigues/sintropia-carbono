export const POST_CATEGORIES = {
  news: {
    label: "Notícias",
    color: "blue",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  discussion: {
    label: "Discussão",
    color: "purple",
    classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  question: {
    label: "Dúvida",
    color: "green",
    classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  help: {
    label: "Pedir Ajuda",
    color: "amber",
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
  },
  link: {
    label: "Link",
    color: "gray",
    classes: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
} as const;

export type PostCategory = keyof typeof POST_CATEGORIES;

export function getCategoryDetails(category: string) {
  const cat = category.toLowerCase() as PostCategory;
  return POST_CATEGORIES[cat] || {
    label: category,
    color: "gray",
    classes: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
}
