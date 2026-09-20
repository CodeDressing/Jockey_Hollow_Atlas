#!/usr/bin/env python3
"""
MycoScope Rutgers Drive photo importer.

Usage:
    py import_rutgers_drive_photos.py "D:\\path\\to\\downloaded-or-synced\\Rutgers"

The script:
- scans every image recursively
- converts HEIC/HEIF/TIFF/PNG/JPEG/WebP to web-friendly JPEG
- creates diagnostic-size originals and thumbnails
- perceptually de-duplicates against the existing MycoScope image assets
- attaches explicit accession-coded photos to existing master records
- places unlabelled photos into collection-level Drive Archive records
- writes drive_data.js
- writes DRIVE_IMPORT_QA.json
- exits non-zero if any source image could not be represented
"""
from __future__ import annotations
import argparse, hashlib, json, os, re, sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Missing Pillow. Run: py -m pip install Pillow pillow-heif", file=sys.stderr)
    raise SystemExit(2)

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIF_ENABLED = True
except Exception:
    HEIF_ENABLED = False

IMAGE_EXTS={".jpg",".jpeg",".png",".webp",".tif",".tiff",".heic",".heif"}
ROOT=Path(__file__).resolve().parent
DATA_JS=ROOT/"data.js"
DRIVE_JS=ROOT/"drive_data.js"
OUT_ORIG=ROOT/"assets"/"drive"/"originals"
OUT_THUMB=ROOT/"assets"/"drive"/"thumbs"
QA_PATH=ROOT/"DRIVE_IMPORT_QA.json"

def norm_code_text(s:str)->str:
    return re.sub(r"[^A-Z0-9]","",s.upper())

def load_codes():
    text=DATA_JS.read_text(encoding="utf-8",errors="replace")
    codes=re.findall(r'"code"\s*:\s*"([^"]+)"',text)
    return sorted(set(codes), key=lambda c: len(norm_code_text(c)), reverse=True)

def detect_specimen(rel:str,codes):
    compact=norm_code_text(rel)
    for code in codes:
        ck=norm_code_text(code)
        pos=compact.find(ck)
        if pos<0: continue
        end=pos+len(ck)
        if end<len(compact) and compact[end].isdigit():
            continue
        return code
    return None

def detect_collection(rel:Path, specimen:str|None):
    if specimen:
        m=re.match(r"^([A-Z]{2}\d+|FN)",specimen.upper())
        if m: return m.group(1)
    for part in rel.parts:
        m=re.search(r"\b([A-Z]{2}\d+|FN)\b",part.upper())
        if m:return m.group(1)
    return "DRIVE"

def family_for(collection:str):
    m=re.match(r"^([A-Z]{2})",collection)
    return m.group(1) if m else "DR"

def safe_stem(s:str):
    s=Path(s).stem
    s=re.sub(r"[^A-Za-z0-9._()\-]+","_",s).strip("._")
    return s[:120] or "photo"

def open_rgb(path:Path):
    if path.suffix.lower() in {".heic",".heif"} and not HEIF_ENABLED:
        # Some files have .HEIC names but JPEG bytes. Pillow can still open those.
        try:
            im=Image.open(path)
        except Exception as e:
            raise RuntimeError("HEIC/HEIF support missing. Run: py -m pip install pillow-heif") from e
    else:
        im=Image.open(path)
    im=ImageOps.exif_transpose(im)
    if im.mode not in ("RGB","L"):
        if "A" in im.mode:
            bg=Image.new("RGB",im.size,"white")
            bg.paste(im,mask=im.getchannel("A"))
            im=bg
        else:
            im=im.convert("RGB")
    elif im.mode=="L":
        im=im.convert("RGB")
    return im

def dhash(im:Image.Image, size=16):
    g=im.convert("L").resize((size+1,size),Image.Resampling.LANCZOS)
    px=list(g.getdata())
    bits=0
    for y in range(size):
        row=y*(size+1)
        for x in range(size):
            bits=(bits<<1) | (1 if px[row+x]>px[row+x+1] else 0)
    return bits

def hamming(a:int,b:int):
    return (a^b).bit_count()

def aspect(im:Image.Image):
    return im.width/im.height if im.height else 0

def iter_existing_images():
    roots=[ROOT/"assets"/"originals"]
    for base in roots:
        if not base.exists(): continue
        for p in base.rglob("*"):
            if p.is_file() and p.suffix.lower() in IMAGE_EXTS and "assets/drive/" not in p.as_posix():
                yield p

def build_existing_hashes():
    out=[]
    for i,p in enumerate(iter_existing_images(),1):
        try:
            with open_rgb(p) as im:
                out.append((dhash(im),aspect(im),p.as_posix()))
        except Exception:
            continue
        if i%100==0:
            print(f"Hashed {i} existing atlas images...")
    return out

def represented_by_existing(h,ar,existing):
    for eh,ear,path in existing:
        if ear and ar and abs(ear-ar)/max(ear,ar) > 0.025:
            continue
        if hamming(h,eh)<=3:
            return path
    return None

def resize_copy(im:Image.Image,max_dim:int):
    out=im.copy()
    if max(out.size)>max_dim:
        out.thumbnail((max_dim,max_dim),Image.Resampling.LANCZOS)
    return out

def save_jpeg(im:Image.Image,path:Path,quality:int):
    path.parent.mkdir(parents=True,exist_ok=True)
    im.save(path,"JPEG",quality=quality,optimize=True,progressive=True,subsampling=0)

def category_for(name:str):
    u=name.upper()
    if "SPMV" in u or "MICRO" in u:
        return "Microscopy"
    if "SPV" in u or re.search(r"SP(?:\D|$)",u):
        return "Spore print / preparation"
    return "Drive archive / additional photo"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("rutgers_folder",type=Path)
    ap.add_argument("--max-original",type=int,default=4096)
    ap.add_argument("--max-thumb",type=int,default=1200)
    ap.add_argument("--quality",type=int,default=93)
    args=ap.parse_args()

    src=args.rutgers_folder.expanduser().resolve()
    if not src.is_dir():
        raise SystemExit(f"Rutgers folder not found: {src}")

    files=sorted([p for p in src.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTS])
    if not files:
        raise SystemExit("No supported images found in the Rutgers folder.")

    codes=load_codes()
    existing=build_existing_hashes()
    imported_hashes=[]
    photos=[]
    qa={
        "source_root":str(src),
        "scanned_images":len(files),
        "imported":0,
        "duplicate_existing":0,
        "duplicate_within_drive":0,
        "attached_to_master":0,
        "unassigned_archive":0,
        "failed":[],
        "duplicates":[],
        "imported_files":[]
    }

    for idx,p in enumerate(files,1):
        rel=p.relative_to(src)
        rel_str=rel.as_posix()
        try:
            with open_rgb(p) as im:
                h=dhash(im); ar=aspect(im)
                dup=represented_by_existing(h,ar,existing)
                if dup:
                    qa["duplicate_existing"]+=1
                    qa["duplicates"].append({"source":rel_str,"represented_by":dup})
                    continue
                drive_dup=None
                for dh,dar,dpath in imported_hashes:
                    if abs(dar-ar)/max(dar,ar) <= 0.025 and hamming(h,dh)<=3:
                        drive_dup=dpath;break
                if drive_dup:
                    qa["duplicate_within_drive"]+=1
                    qa["duplicates"].append({"source":rel_str,"represented_by":drive_dup})
                    continue

                specimen=detect_specimen(rel_str,codes)
                collection=detect_collection(rel,specimen)
                stem=safe_stem(p.name)
                suffix=hashlib.sha1(rel_str.encode("utf-8")).hexdigest()[:8]
                out_name=f"{stem}__{suffix}.jpg"
                orig_rel=Path("assets")/"drive"/"originals"/collection/out_name
                thumb_rel=Path("assets")/"drive"/"thumbs"/collection/out_name
                orig=ROOT/orig_rel; thumb=ROOT/thumb_rel

                o=resize_copy(im,args.max_original)
                t=resize_copy(im,args.max_thumb)
                save_jpeg(o,orig,args.quality)
                save_jpeg(t,thumb,86)

                item={
                    "folder":rel.parts[0] if rel.parts else collection,
                    "collection":collection,
                    "family":family_for(collection),
                    "specimen":specimen,
                    "category":category_for(p.name),
                    "filename":p.name,
                    "caption":f"Google Drive source — {p.name}",
                    "original":orig_rel.as_posix(),
                    "thumb":thumb_rel.as_posix(),
                    "source_relpath":rel_str
                }
                photos.append(item)
                imported_hashes.append((h,ar,orig_rel.as_posix()))
                qa["imported"]+=1
                qa["attached_to_master"]+=1 if specimen else 0
                qa["unassigned_archive"]+=0 if specimen else 1
                qa["imported_files"].append(item)
        except Exception as e:
            qa["failed"].append({"source":rel_str,"error":str(e)})

        if idx%25==0 or idx==len(files):
            print(f"Processed {idx}/{len(files)} source images...")

    DRIVE_JS.write_text("window.DRIVE_PHOTOS = "+json.dumps(photos,ensure_ascii=False,indent=2)+";\n",encoding="utf-8")

    missing_paths=[]
    for p in photos:
        for k in ("original","thumb"):
            if not (ROOT/p[k]).is_file():
                missing_paths.append(p[k])

    qa["drive_data_entries"]=len(photos)
    qa["missing_generated_paths"]=missing_paths
    qa["represented_total"]=qa["imported"]+qa["duplicate_existing"]+qa["duplicate_within_drive"]
    qa["all_source_images_represented"]=(qa["represented_total"]==qa["scanned_images"] and not qa["failed"] and not missing_paths)
    QA_PATH.write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding="utf-8")

    print("\n=== MycoScope Drive Import QA ===")
    print(f"Scanned:              {qa['scanned_images']}")
    print(f"Imported into app:    {qa['imported']}")
    print(f"Already represented:  {qa['duplicate_existing']}")
    print(f"Drive duplicates:     {qa['duplicate_within_drive']}")
    print(f"Attached to master:   {qa['attached_to_master']}")
    print(f"Unassigned archives:  {qa['unassigned_archive']}")
    print(f"Failed:               {len(qa['failed'])}")
    print(f"All represented:      {qa['all_source_images_represented']}")
    print(f"QA report:            {QA_PATH}")

    if not qa["all_source_images_represented"]:
        raise SystemExit(3)

if __name__=="__main__":
    main()
