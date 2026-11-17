"""Validate the five original JN1-F29 JPGs and provenance-aware gallery."""
# LEDGER — 01 files 02 image associations 03 scientific limits
import hashlib
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"research/jn1-f29/field-intake-20261117.json"
JS=ROOT/"research/jn1_f29_field_gallery_20261117.js"

class JN1F29FieldAcceptance(unittest.TestCase):
    def test_five_originals(self):
        manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(manifest["accession"],"JN1-F29")
        self.assertEqual(len(manifest["images"]),5)
        self.assertEqual([r["filename"] for r in manifest["images"]],
                         [f"IMG_{n}.jpg" for n in range(5915,5920)])
        for record in manifest["images"]:
            file=ROOT/record["path"]
            self.assertTrue(file.is_file(),str(file))
            blob=file.read_bytes()
            self.assertEqual(len(blob),record["bytes"])
            self.assertEqual(hashlib.sha256(blob).hexdigest(),record["sha256"])
            self.assertTrue(blob.startswith(b"\xff\xd8\xff"))
            git_blob=hashlib.sha1(f"blob {len(blob)}\0".encode()+blob).hexdigest()
            self.assertEqual(git_blob,record["git_blob_sha"])

    def test_gallery_binding_and_scope(self):
        html=(ROOT/"index.html").read_text(encoding="utf-8")
        script=JS.read_text(encoding="utf-8")
        name="research/jn1_f29_field_gallery_20261117.js"
        self.assertEqual(html.count(name),1)
        self.assertLess(html.index(name),html.index('<script src="app.js"></script>'))
        for number in range(5915,5920):
            self.assertIn(f"assets/jn1-f29/field/IMG_{number}.jpg",script)
            self.assertIn(f'"filename":"IMG_{number}.jpg"',script)
        self.assertEqual(script.count('"specimen":"JN1-F29"'),5)
        self.assertIn("shallow",script)
        self.assertIn("crowded",script)
        self.assertIn("fibrillose",script)
        self.assertIn("unconfirmed",script)
        self.assertNotIn("drive.google.com",script)
        self.assertNotIn("docs.google.com",script)

if __name__=="__main__":
    unittest.main()
