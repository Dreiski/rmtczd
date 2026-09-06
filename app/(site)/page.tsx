import Carousel from "@/components/sections/Carousel";
import { listFeaturedWorks } from "@/lib/works";

export default async function Home() {
  const works = await listFeaturedWorks();

  const items = works.map((work) => ({
    id: work.id,
    label: work.title,
    href: `/${work.category}/${work.slug}`,
  }));

  return (
    <main className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      <Carousel items={items} />
    </main>
  );
}
