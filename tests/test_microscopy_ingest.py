"""Regression tests for exact-byte and accession-safe microscopy intake."""
# LEDGER — 01 fixture; 02 valid release; 03 rejection checks.
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from zipfile import ZipFile

TOOL = Path(__file__).resolve().parents[1] / "scripts" / "ingest_microscopy.py"
PNG = bytes.fromhex("89504e470d0a1a0a") + b"fake-png-test-payload"

class IntakeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "data.js").write_text('window.ATLAS_DATA=[{"code":"JN1-F29"}]', encoding="utf-8")
        (self.root / "index.html").write_text('<script src="app.js"></script>', encoding="utf-8")
        self.archive = self.root / "microscopy.zip"
        self.manifest = {
            "accession": "JN1-F29",
            "images": [{"filename":"JN1-F29 SPM (1).png", "bytes":len(PNG), "sha256":hashlib.sha256(PNG).hexdigest()}]
        }
        self.write_archive()

    def write_archive(self, payload=PNG):
        with ZipFile(self.archive, "w") as z:
            z.writestr("research/jn1-f29/microscopy-intake.json", json.dumps(self.manifest))
            z.writestr("assets/jn1-f29/microscopy/JN1-F29 SPM (1).png", payload)

    def run_tool(self, apply=False):
        args=[sys.executable, str(TOOL), str(self.archive), "--root", str(self.root)]
        if apply:
            args.append("--apply")
        return subprocess.run(args, capture_output=True, text=True)

    def test_dry_run_preserves_files(self):
        result=self.run_tool()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('"verified_originals": 1', result.stdout)
        self.assertFalse((self.root/"assets").exists())

    def test_apply_preserves_originals_and_wires_gallery(self):
        result=self.run_tool(apply=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        target=self.root/"assets/jn1-f29/microscopy/JN1-F29 SPM (1).png"
        self.assertEqual(target.read_bytes(), PNG)
        self.assertIn("research/jn1_f29_microscopy_gallery.js", (self.root/"index.html").read_text())
        gallery=(self.root/"research/jn1_f29_microscopy_gallery.js").read_text()
        self.assertIn("JN1-F29%20SPM%20(1).png", gallery)
        self.assertIn('"specimen": "JN1-F29"', gallery)

    def test_modified_original_rejected_without_writes(self):
        self.write_archive(payload=PNG+b"changed")
        result=self.run_tool(apply=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("mismatch", result.stderr)
        self.assertFalse((self.root/"assets").exists())

    def test_missing_accession_rejected(self):
        (self.root/"data.js").write_text('window.ATLAS_DATA=[]', encoding="utf-8")
        result=self.run_tool(apply=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("absent", result.stderr)
        self.assertFalse((self.root/"assets").exists())

if __name__ == "__main__":
    unittest.main()
