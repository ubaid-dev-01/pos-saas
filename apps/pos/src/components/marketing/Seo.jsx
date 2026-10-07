import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  let selector =
    attr === "name" ? `meta[name=\"${key}\"]` : `meta[property=\"${key}\"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Seo({
  title,
  description,
  keywords,
  url = "https://pos-saas-kappa.vercel.app",
  image = "https://pos-saas-kappa.vercel.app/files/og-image.png",
}) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    if (keywords) {
      upsertMeta("name", "keywords", keywords);
    }
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [description, image, keywords, title, url]);

  return null;
}
