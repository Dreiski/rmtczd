import { listAssets } from "@/lib/admin-assets";
import { publicUrlFor } from "@/lib/storage";
import ImageUploader from "./ImageUploader";
import ReorderableAssets from "./ReorderableAssets";
import type { Work } from "@/lib/types";

/**
 * Image management for one work. Server component: it resolves storage keys to
 * URLs — storage layout is not the client's business — and hands the rest to
 * the client components that need interactivity.
 */
export default async function AssetManager({ work }: { work: Work }) {
  const assets = await listAssets(work.id);

  return (
    <section className="flex flex-col gap-6 border-t border-border pt-8">
      <div>
        <h2 className="text-xl font-light tracking-wide">Images</h2>
        <p className="mt-1 text-sm text-subtle">
          {work.kind === "video"
            ? "Snapshots from the video. The cover is the poster frame visitors see before pressing play."
            : "The cover is what visitors see on the card."}
          {assets.length > 1 && " Drag to change the order they appear in."}
        </p>
      </div>

      <ImageUploader workId={work.id} />

      <ReorderableAssets
        workId={work.id}
        coverAssetId={work.cover_asset_id}
        assets={assets.map((asset) => ({
          id: asset.id,
          url: publicUrlFor(asset.storage_key),
          alt: asset.alt,
          width: asset.width,
          height: asset.height,
        }))}
      />
    </section>
  );
}
