"use client";

import { categoryTranslations } from "@/lib/constants";

type Category = "supplies" | "clothing" | "food" | "other";

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const categoryColors: Record<Category, string> = {
    supplies:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    clothing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[category]}`}
    >
      {categoryTranslations[category].label}
    </div>
  );
}
