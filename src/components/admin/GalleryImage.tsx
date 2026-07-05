import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/gallery";
import { cn } from "@/lib/utils";

export function GalleryImage({
  path,
  alt,
  className,
}: {
  path: string;
  alt?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    getSignedUrl(path)
      .then((u) => mounted && setUrl(u))
      .catch(() => mounted && setUrl(null));
    return () => {
      mounted = false;
    };
  }, [path]);
  if (!url)
    return <div className={cn("bg-muted animate-pulse", className)} aria-hidden />;
  return <img src={url} alt={alt ?? ""} className={className} loading="lazy" />;
}