import { listAssets } from "@/lib/admin-assets";
import { publicUrlFor } from "@/lib/storage";
import ImageUploader from "./ImageUploader";
import ReorderableAssets from "./ReorderableAssets";
import { EmptyState } from "./ui";
import type { Work } from "@/lib/types";

/**
 * Image management for one work. Server component: it resolves storage keys to
 * URLs — storage layout is not the client's business — and hands the rest to
 * the client components that need interactivity.
 *
 * A video work's cover is its thumbnail: the frame a visitor sees on the card
 * and behind the play button before anything loads. The mechanism is the same
 * as a photo work's cover, but the word "cover" means nothing to someone
 * uploading a still from their film, so the labels change with the kind.
 */
export default async function AssetManager({ work }: { work: Work }) {
  const assets = await listAssets(work.id);
  const isVideo = work.kind === "video";

  const heading = isVideo ? "Thumbnail and stills" : "Images";
  const description = isVideo
    ? "The thumbnail is the frame visitors see on the card and behind the play button. Upload a still, then mark it as the thumbnail."
    : "The cover is the image visitors see on the card in the gallery.";

  return (
    <section className="flex flex-col gap-5 border-t border-border pt-8">
      <div>
        <h2 className="text-lg font-medium tracking-wide">{heading}</h2>
        <p className="mt-1 max-w-prose text-sm text-subtle">
          {description}
          {assets.length > 1 && " Drag to change the order they appear in."}
        </p>
      </div>

      {isVideo && !work.cover_asset_id && (
        <p className="rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent">
          This video has no thumbnail yet, so its card shows a plain tile. Upload
          a still below — the first one you add becomes the thumbnail.
        </p>
      )}

      <ImageUploader workId={work.id} />

      {assets.length === 0 ? (
        <EmptyState
          title={isVideo ? "No stills yet" : "No images yet"}
          description={
            isVideo
              ? "Add a frame from the video so the card has something to show."
              : "Add images and they will appear in the gallery in the order you set."
          }
        />
      ) : (
        <ReorderableAssets
          workId={work.id}
          coverAssetId={work.cover_asset_id}
          isVideo={isVideo}
          assets={assets.map((asset) => ({
            id: asset.id,
            url: publicUrlFor(asset.storage_key),
            alt: asset.alt,
            width: asset.width,
            height: asset.height,
          }))}
        />
      )}
    </section>
  );
}
