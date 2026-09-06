import Image from "next/image";
import { listAssets } from "@/lib/admin-assets";
import { deleteAsset, makeCover, saveAltText } from "@/lib/asset-actions";
import { publicUrlFor } from "@/lib/storage";
import ImageUploader from "./ImageUploader";
import type { Work } from "@/lib/types";

/**
 * Image management for one work. Server component: the uploader is the only
 * part that needs to be interactive.
 */
export default async function AssetManager({ work }: { work: Work }) {
  const assets = await listAssets(work.id);

  return (
    <section className="flex flex-col gap-6 border-t border-border pt-8">
      <div>
        <h2 className="text-xl font-light tracking-wide">Images</h2>
        <p className="mt-1 text-sm text-subtle">
          {work.kind === "video"
            ? "Snapshots from the video. The cover is what visitors see on the card."
            : "The cover is what visitors see on the card."}
        </p>
      </div>

      <ImageUploader workId={work.id} />

      {assets.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assets.map((asset) => {
            const isCover = work.cover_asset_id === asset.id;

            return (
              <li
                key={asset.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3"
              >
                <div className="relative aspect-[3/2] overflow-hidden rounded bg-surface">
                  <Image
                    src={publicUrlFor(asset.storage_key)}
                    alt={asset.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {isCover && (
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white">
                      Cover
                    </span>
                  )}
                </div>

                <form action={saveAltText} className="flex flex-col gap-2">
                  <input type="hidden" name="workId" value={work.id} />
                  <input type="hidden" name="assetId" value={asset.id} />
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-subtle">
                      Description (read aloud by screen readers)
                    </span>
                    <input
                      name="alt"
                      defaultValue={asset.alt}
                      className="rounded border border-border bg-card px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className="self-start text-[10px] uppercase tracking-widest text-subtle hover:opacity-60"
                  >
                    Save description
                  </button>
                </form>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-subtle">
                    {asset.width}×{asset.height}
                  </span>

                  <div className="flex items-center gap-4">
                    {!isCover && (
                      <form action={makeCover}>
                        <input type="hidden" name="workId" value={work.id} />
                        <input type="hidden" name="assetId" value={asset.id} />
                        <button
                          type="submit"
                          className="text-[10px] uppercase tracking-widest text-subtle hover:opacity-60"
                        >
                          Make cover
                        </button>
                      </form>
                    )}

                    <form action={deleteAsset}>
                      <input type="hidden" name="workId" value={work.id} />
                      <input type="hidden" name="assetId" value={asset.id} />
                      <button
                        type="submit"
                        className="text-[10px] uppercase tracking-widest text-accent hover:opacity-60"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
