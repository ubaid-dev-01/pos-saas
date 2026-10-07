import re
import shutil
import tarfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
nm = root / "node_modules"
nm.mkdir(exist_ok=True)

tarballs = list(root.glob("*.tgz")) + list((root / ".packs").glob("*.tgz")) if (root / ".packs").exists() else list(root.glob("*.tgz"))

for tgz in tarballs:
    name = tgz.name
    # scoped: types-node-22.10.2.tgz -> @types/node
    m = re.match(r"^(types-.+?)-(\d+\.\d+\.\d+.*)\.tgz$", name)
    if m:
        pkg = "@types/" + m.group(1).removeprefix("types-")
    else:
        m = re.match(r"^(.+)-(\d+\.\d+\.\d+.*)\.tgz$", name)
        if not m:
            print("skip", name)
            continue
        pkg = m.group(1)

    dest = nm.joinpath(*pkg.split("/"))
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    with tarfile.open(tgz, "r:gz") as tar:
        members = tar.getmembers()
        for member in members:
            # strip package/ prefix
            parts = Path(member.name).parts
            if parts[0] != "package":
                continue
            member.name = str(Path(*parts[1:]))
            if member.name == "." or member.name == "":
                continue
            tar.extract(member, path=dest)
    print("extracted", pkg, "->", dest)
