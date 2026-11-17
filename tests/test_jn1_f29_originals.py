"""R17.1 exact original microscopy release regression: runs on CI and local clones."""
# LEDGER — 01 manifest verification; 02 gallery binding; 03 privacy.
import hashlib
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
ACCESSION="JN1-F29"
BASE=ROOT/"assets/jn1-f29/microscopy"
MANIFEST=ROOT/"research/jn1-f29/microscopy-intake.json"
GALLERY=ROOT/"research/jn1_f29_microscopy_gallery_20261117.js"

class RealIntakeChecks(unittest.TestCase):
    def test_all_17_originals_match_manifest(self):
        manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(manifest["accession"],ACCESSION)
        records=manifest["images"]
        self.assertEqual(len(records),17)
        names=set()
        for item in records:
            name=item["filename"]
            self.assertNotIn(name,names)
            names.add(name)
            path=BASE/name
            self.assertTrue(path.is_file(),name)
            original=path.read_bytes()
            self.assertEqual(len(original),item["bytes"])
            self.assertEqual(hashlib.sha256(original).hexdigest(),item["sha256"])
            self.assertTrue(original.startswith(bytes.fromhex("89504e470d0a1a0a")))
        self.assertEqual({p.name for p in BASE.iterdir() if p.is_file()},names)

    def test_gallery_loaded_before_app_and_17_distinct_paths(self):
        html=(ROOT/"index.html").read_text(encoding="utf-8")
        name="research/jn1_f29_microscopy_gallery_20261117.js"
        self.assertEqual(html.count(name),1)
        self.assertLess(html.index(name),html.index('<script src="app.js"></script>'))
        script=GALLERY.read_text(encoding="utf-8")
        for n in range(1,18):
            self.assertIn(f"JN1-F29%20SPM%20({n}).png",script)
            self.assertIn(f'JN1-F29 SPM ({n}).png',script)
        self.assertEqual(script.count('"specimen":"JN1-F29"'),17)
        self.assertNotIn("drive.google.com",script)
        self.assertNotIn("docs.google.com",script)

if __name__=="__main__":
    unittest.main()
