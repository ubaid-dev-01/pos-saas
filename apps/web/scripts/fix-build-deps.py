import re
import shutil
import subprocess
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKS = ROOT / ".packs"
NM = ROOT / "node_modules"
NEXT = NM / "next" / "dist" / "bin" / "next"
PACKS.mkdir(exist_ok=True)

SPECIAL = {
    "alloc-quick-lru": "@alloc/quick-lru",
    "next-env": "@next/env",
    "swc-helpers": "@swc/helpers",
    "swc-counter": "@swc/counter",
    "jridgewell-gen-mapping": "@jridgewell/gen-mapping",
    "jridgewell-trace-mapping": "@jridgewell/trace-mapping",
    "jridgewell-sourcemap-codec": "@jridgewell/sourcemap-codec",
    "jridgewell-resolve-uri": "@jridgewell/resolve-uri",
    "jridgewell-set-array": "@jridgewell/set-array",
    "nodelib-fs.stat": "@nodelib/fs.stat",
    "nodelib-fs.walk": "@nodelib/fs.walk",
    "nodelib-fs.scandir": "@nodelib/fs.scandir",
}


def pkg_from_tgz(name: str) -> str | None:
    for k, v in SPECIAL.items():
        if name.startswith(k + "-"):
            return v
    if name.startswith("types-"):
        m = re.match(r"^types-(.+)-(\d+\.\d+\.\d+.*)\.tgz$", name)
        return "@types/" + m.group(1) if m else None
    m = re.match(r"^(.+)-(\d+\.\d+\.\d+.*)\.tgz$", name)
    return m.group(1) if m else None


def extract_tgz(tgz: Path) -> None:
    pkg = pkg_from_tgz(tgz.name)
    if not pkg:
        return
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


def ensure(pkg: str) -> None:
    print("ensure", pkg)
    subprocess.run(
        ["npm.cmd", "pack", pkg, "--pack-destination", str(PACKS)],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    # extract matching newest tarball for this pkg
    key = pkg.split("@")[0] if not pkg.startswith("@") else "@".join(pkg.split("@")[:2])
    # pack names drop @
    candidates = sorted(PACKS.glob("*.tgz"), key=lambda p: p.stat().st_mtime, reverse=True)
    for tgz in candidates:
        name = pkg_from_tgz(tgz.name)
        if name == key or (key.startswith("@") and name == key):
            extract_tgz(tgz)
            return
        # bare package without version in ensure arg
        if name and (name == pkg or pkg.startswith(name + "@")):
            extract_tgz(tgz)
            return
    # fallback extract all recent
    for tgz in candidates[:5]:
        extract_tgz(tgz)


def missing_from_log(text: str) -> list[str]:
    found = []
    for m in re.finditer(r"Cannot find module '([^']+)'", text):
        mod = m.group(1)
        if mod.startswith(".") or mod.startswith("/") or ":" in mod and not mod.startswith("@"):
            # skip absolute windows paths unless scoped package only
            if re.match(r"^[A-Za-z]:\\", mod):
                continue
        # normalize path requires to package name
        if mod.startswith("@"):
            parts = mod.split("/")
            found.append("/".join(parts[:2]))
        else:
            found.append(mod.split("/")[0])
    # also Can't resolve 'x'
    for m in re.finditer(r"Can't resolve '([^']+)'", text):
        mod = m.group(1)
        if mod.startswith("."):
            continue
        if mod.startswith("@"):
            parts = mod.split("/")
            found.append("/".join(parts[:2]))
        else:
            found.append(mod.split("/")[0])
    # dedupe
    out = []
    for x in found:
        if x not in out:
            out.append(x)
    return out


def main() -> None:
    for i in range(25):
        print(f"\n=== build attempt {i+1} ===")
        proc = subprocess.run(
            ["node", str(NEXT), "build"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        text = (proc.stdout or "") + "\n" + (proc.stderr or "")
        if proc.returncode == 0:
            print(text[-2000:])
            print("BUILD OK")
            return
        miss = missing_from_log(text)
        print("missing:", miss)
        print(text[-1500:])
        if not miss:
            print("No parseable missing modules; stopping")
            return
        for m in miss:
            ensure(m)
    print("Gave up after retries")


if __name__ == "__main__":
    main()
