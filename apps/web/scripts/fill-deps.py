"""Pack and extract whatever the next build is missing, iteratively if needed."""
import re
import shutil
import subprocess
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKS = ROOT / ".packs"
NM = ROOT / "node_modules"
PACKS.mkdir(exist_ok=True)

EXTRA = [
    "camelcase-css@2.0.1",
    "cssesc@3.0.0",
    "util-deprecate@1.0.2",
    "streamsearch@1.1.0",
    "braces@3.0.3",
    "fill-range@7.1.1",
    "to-regex-range@5.0.1",
    "is-number@7.0.0",
    "readdirp@3.6.0",
    "anymatch@3.1.3",
    "is-extglob@2.1.1",
    "binary-extensions@2.3.0",
    "picomatch@2.3.1",
    "pirates@4.0.6",
    "lines-and-columns@1.2.4",
    "mz@2.7.0",
    "commander@4.1.1",
    "any-promise@1.3.0",
    "thenify@3.3.1",
    "thenify-all@1.6.0",
    "ts-interface-checker@0.1.13",
    "object-assign@4.1.1",
    "function-bind@1.1.2",
    "hasown@2.0.2",
    "is-core-module@2.16.1",
    "path-parse@1.0.7",
    "supports-preserve-symlinks-flag@1.0.0",
    "read-cache@1.0.0",
    "pify@2.3.0",
    "cssesc@3.0.0",
    "fraction.js@4.3.7",
    "normalize-range@0.1.2",
    "escalade@3.2.0",
    "node-releases@2.0.19",
    "electron-to-chromium@1.5.76",
    "update-browserslist-db@1.1.1",
    "browserslist@4.24.3",
    "baseline-browser-mapping@2.9.0",
    "@nodelib/fs.stat@2.0.5",
    "@nodelib/fs.walk@1.2.8",
    "@nodelib/fs.scandir@2.1.5",
    "fastq@1.17.1",
    "reusify@1.0.4",
    "run-parallel@1.2.0",
    "queue-microtask@1.2.3",
    "merge2@1.4.1",
    "micromatch@4.0.8",
    "yaml@2.6.1",
    "lilconfig@3.1.3",
]


def pkg_from_tgz(name: str) -> str | None:
    special = {
        "alloc-quick-lru": "@alloc/quick-lru",
        "next-env": "@next/env",
        "swc-helpers": "@swc/helpers",
        "swc-counter": "@swc/counter",
        "jridgewell-gen-mapping": "@jridgewell/gen-mapping",
        "jridgewell-trace-mapping": "@jridgewell/trace-mapping",
        "jridgewell-sourcemap-codec": "@jridgewell/sourcemap-codec",
        "jridgewell-resolve-uri": "@jridgewell/resolve-uri",
        "nodelib-fs.stat": "@nodelib/fs.stat",
        "nodelib-fs.walk": "@nodelib/fs.walk",
        "nodelib-fs.scandir": "@nodelib/fs.scandir",
    }
    for k, v in special.items():
        if name.startswith(k + "-"):
            return v
    if name.startswith("types-"):
        m = re.match(r"^types-(.+)-(\d+\.\d+\.\d+.*)\.tgz$", name)
        return "@types/" + m.group(1) if m else None
    m = re.match(r"^(.+)-(\d+\.\d+\.\d+.*)\.tgz$", name)
    return m.group(1) if m else None


def extract_all() -> None:
    for tgz in PACKS.glob("*.tgz"):
        pkg = pkg_from_tgz(tgz.name)
        if not pkg:
            continue
        dest = NM.joinpath(*pkg.split("/"))
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True)
        with tarfile.open(tgz, "r:gz") as tar:
            for member in tar.getmembers():
                parts = Path(member.name).parts
                if not parts or parts[0] != "package":
                    continue
                member.name = str(Path(*parts[1:]))
                if member.name in ("", "."):
                    continue
                tar.extract(member, path=dest)


def main() -> None:
    for dep in EXTRA:
        print("pack", dep)
        subprocess.run(
            ["npm", "pack", dep, "--pack-destination", str(PACKS)],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    extract_all()
    print("done")


if __name__ == "__main__":
    main()
