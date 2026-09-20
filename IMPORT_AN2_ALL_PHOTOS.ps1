param(
  [Parameter(Mandatory=$true)]
  [string]$AN2Path
)
$ErrorActionPreference="Stop"
if (-not (Test-Path $AN2Path)) { throw "AN2 folder not found: $AN2Path" }
if (-not (Test-Path ".git")) { throw "Run this from the Jockey_Hollow_Atlas repository root." }

Write-Host "=== AN2 COMPLETE PHOTO INGEST ===" -ForegroundColor Cyan
Write-Host "Source: $AN2Path"

git pull --rebase origin main
if ($LASTEXITCODE -ne 0) { throw "git pull failed" }

py -m pip install -r requirements-drive-import.txt
if ($LASTEXITCODE -ne 0) { throw "dependency install failed" }

py import_rutgers_drive_photos.py "$AN2Path" --collection AN2
if ($LASTEXITCODE -ne 0) { throw "AN2 import QA failed" }

$qa=Get-Content DRIVE_IMPORT_QA.json -Raw | ConvertFrom-Json
Write-Host ""
Write-Host "AN2 QA" -ForegroundColor Cyan
Write-Host ("Scanned: " + $qa.scanned_images)
Write-Host ("Imported: " + $qa.imported)
Write-Host ("Already represented: " + $qa.duplicate_existing)
Write-Host ("Attached to explicit accessions: " + $qa.attached_to_master)
Write-Host ("Unassigned AN2 archive photos: " + $qa.unassigned_archive)
Write-Host ("Failed: " + $qa.failed.Count)
Write-Host ("All represented: " + $qa.all_source_images_represented)

if (-not $qa.all_source_images_represented) { throw "Not every AN2 source image is represented. Stopping before deploy." }

git add -A
$changes=git status --porcelain
if (-not [string]::IsNullOrWhiteSpace(($changes -join ""))) {
  git commit -m "Import every available AN2 photograph"
  if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
}
git push origin main
if ($LASTEXITCODE -ne 0) { throw "git push failed" }
Write-Host "AN2 import pushed. Render auto-deploy should publish it." -ForegroundColor Green
