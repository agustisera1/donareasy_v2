import { Badge } from "@/components/ui/badge";
import { categoryTranslations } from "@/lib/constants";

type Category = "supplies" | "clothing" | "food" | "other";

const categoryTones: Record<Category, string> = {
  supplies: "bg-category-supplies/15 text-category-supplies dark:bg-category-supplies/20",
  clothing: "bg-category-clothing/15 text-category-clothing dark:bg-category-clothing/20",
  food: "bg-category-food/15 text-category-food dark:bg-category-food/20",
  other: "bg-category-other/15 text-category-other dark:bg-category-other/20",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge className={categoryTones[category]}>
      {categoryTranslations[category].label}
    </Badge>
  );
}
