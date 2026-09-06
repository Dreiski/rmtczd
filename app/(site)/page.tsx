import CategoryGrid from "@/components/works/CategoryGrid";
import { listCategoryPreviews } from "@/lib/works";

export default async function Home() {
  const previews = await listCategoryPreviews();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <CategoryGrid previews={previews} />
    </main>
  );
}
