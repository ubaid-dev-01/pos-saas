"""Compress marketing JPEGs and emit WebP siblings for Lighthouse payload wins."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "marketing"

PRESETS = {
    "hero-live-snapshot.jpg": (1440, 72),
    "showcase-analytics.jpg": (1200, 72),
    "showcase-loyalty.jpg": (1200, 72),
    "snapshot-inventory.jpg": (1200, 72),
    "snapshot-checkout.jpg": (1200, 72),
    "snapshot-customers.jpg": (1200, 72),
    "snapshot-payment.jpg": (900, 72),
    "feature-team.jpg": (900, 72),
    "feature-receipts.jpg": (900, 72),
    "about-store.jpg": (900, 72),
    "testimonial-ahmed.jpg": (480, 75),
    "testimonial-fatima.jpg": (480, 75),
}


def optimize(path: Path, max_width: int, quality: int) -> None:
    before = path.stat().st_size
    with Image.open(path) as im:
        im = im.convert("RGB")
        if im.width > max_width:
            ratio = max_width / im.width
            im = im.resize((max_width, max(1, int(im.height * ratio))), Image.Resampling.LANCZOS)

        webp_path = path.with_suffix(".webp")
        tmp_jpg = path.with_suffix(".optimized.jpg")
        im.save(tmp_jpg, format="JPEG", quality=quality, optimize=True, progressive=True)
        im.save(webp_path, format="WEBP", quality=quality, method=6)
        tmp_jpg.replace(path)

    after_jpg = path.stat().st_size
    after_webp = webp_path.stat().st_size
    print(
        f"{path.name}: {before/1024:.0f}KB -> jpg {after_jpg/1024:.0f}KB, "
        f"webp {after_webp/1024:.0f}KB"
    )


def main() -> None:
    for path in sorted(ROOT.glob("*.jpg")):
        width, quality = PRESETS.get(path.name, (1200, 72))
        optimize(path, width, quality)
    print("Done.")


if __name__ == "__main__":
    main()
