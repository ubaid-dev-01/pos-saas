/** Responsive marketing photo with WebP + JPEG fallback and intrinsic size. */
export default function MarketingImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  sizes,
}) {
  const webpSrc = src.replace(/\.jpe?g$/i, ".webp");
  const isJpeg = /\.jpe?g$/i.test(src);
  const pictureClassName = className.includes("absolute")
    ? "absolute inset-0 block h-full w-full"
    : "contents";

  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      sizes={sizes}
    />
  );

  if (!isJpeg) return img;

  return (
    <picture className={pictureClassName}>
      <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
      {img}
    </picture>
  );
}
