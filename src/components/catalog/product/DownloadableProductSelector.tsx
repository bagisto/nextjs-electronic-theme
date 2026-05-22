"use client";

export type DownloadableLinkEdge = {
  node: {
    _id: number | string;
    type?: string;
    translation?: { title?: string };
    price?: string | number;
    formattedPrice?: string;
    sampleType?: string;
    sampleFile?: string;
    sampleFileUrl?: string;
    sampleUrl?: string;
  };
};

export type DownloadableSampleEdge = {
  node: {
    _id: number | string;
    type?: string;
    file?: string;
    fileUrl?: string;
    url?: string;
    translation?: { title?: string };
  };
};

interface Props {
  downloadableLinks: { edges: DownloadableLinkEdge[] } | null | undefined;
  downloadableSamples?: { edges: DownloadableSampleEdge[] } | null | undefined;
  selectedLinks: number[];
  onToggleLink: (linkId: number | string) => void;
}

const parseId = (id: string | number): number => {
  if (typeof id === "number") return id;
  const parts = String(id).split("/");
  return parseInt(parts[parts.length - 1], 10);
};

export function DownloadableProductSelector({
  downloadableLinks,
  downloadableSamples,
  selectedLinks,
  onToggleLink,
}: Props) {
  const links = downloadableLinks?.edges || [];
  const samples = downloadableSamples?.edges || [];

  return (
    <div className="space-y-6">
      {samples.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-white uppercase tracking-wider">
            Samples
          </h3>
          <div className="space-y-2">
            {samples.map((edge, index: number) => (
              <a
                key={index}
                href={edge.node.fileUrl || edge.node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {edge.node.translation?.title || "Download Sample"}
              </a>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-white uppercase tracking-wider">
            Links
          </h3>
          <div className="space-y-3">
            {links.map((edge) => {
              const link = edge.node;
              const isSelected = selectedLinks.includes(parseId(link._id));
              return (
                <div
                  key={String(link._id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-green-500 transition-colors"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-neutral-300 text-green-500 focus:ring-green-500 cursor-pointer"
                      checked={isSelected}
                      onChange={() => onToggleLink(link._id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white break-all">
                        {link.translation?.title}
                      </p>
                      {Number(link.price) > 0 && (
                        <p className="text-xs text-neutral-500">{link.formattedPrice}</p>
                      )}
                    </div>
                  </label>
                  {(link.sampleFileUrl || link.sampleUrl) && (
                    <a
                      href={link.sampleFileUrl || link.sampleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-sm text-blue-600 hover:underline dark:text-blue-400 whitespace-nowrap"
                    >
                      Sample
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
