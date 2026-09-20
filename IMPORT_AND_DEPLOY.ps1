param(
  [string]$RutgersPath = ""
)

$ErrorActionPreference = "Stop"

function Fail($msg) {
  Write-Host ""
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

Write-Host "=== MycoScope Complete Rutgers Photo Import + Deploy ===" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
  Fail "Run this script from the root of the Jockey_Hollow_Atlas Git repository."
}

if ([string]::IsNullOrWhiteSpace($RutgersPath)) {
  $candidates = @(
    "G:\My Drive\Mycology\Rutgers",
    "G:\My Drive\Rutgers",
    "H:\My Drive\Mycology\Rutgers",
    "H:\My Drive\Rutgers",
    "D:\My Drive\Mycology\Rutgers",
    "D:\My Drive\Rutgers",
    "$env:USERPROFILE\Google Drive\My Drive\Mycology\Rutgers",
    "$env:USERPROFILE\Google Drive\My Drive\Rutgers",
    "$env:USERPROFILE\My Drive\Mycology\Rutgers",
    "$env:USERPROFILE\My Drive\Rutgers"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) {
      $RutgersPath = $p
      break
    }
  }
}

if ([string]::IsNullOrWhiteSpace($RutgersPath) -or -not (Test-Path $RutgersPath)) {
  Write-Host ""
  Write-Host "Rutgers folder was not auto-detected." -ForegroundColor Yellow
  Write-Host "Run again with the full local Google Drive path, for example:"
  Write-Host '  powershell -ExecutionPolicy Bypass -File .\IMPORT_AND_DEPLOY.ps1 -RutgersPath "G:\My Drive\Mycology\Rutgers"'
  exit 2
}

Write-Host "Rutgers source: $RutgersPath" -ForegroundColor Green

if (Test-Path ".git\index.lock") {
  Write-Host "Removing stale .git\index.lock..." -ForegroundColor Yellow
  Remove-Item -Force ".git\index.lock"
}

Write-Host "Updating repository..." -ForegroundColor Cyan
git fetch origin
if ($LASTEXITCODE -ne 0) { Fail "git fetch failed." }

git pull --rebase origin main
if ($LASTEXITCODE -ne 0) { Fail "git pull --rebase failed. Resolve the Git conflict before continuing." }

Write-Host "Installing importer dependencies..." -ForegroundColor Cyan
py -m pip install -r requirements-drive-import.txt
if ($LASTEXITCODE -ne 0) { Fail "Python dependency installation failed." }

Write-Host "Scanning, pairing, converting, and de-duplicating Rutgers photos..." -ForegroundColor Cyan
py import_rutgers_drive_photos.py "$RutgersPath"
if ($LASTEXITCODE -ne 0) { Fail "Photo import QA failed. Do not deploy until DRIVE_IMPORT_QA.json is clean." }

if (-not (Test-Path "DRIVE_IMPORT_QA.json")) {
  Fail "DRIVE_IMPORT_QA.json was not created."
}

$qa = Get-Content "DRIVE_IMPORT_QA.json" -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "=== QA RESULT ===" -ForegroundColor Cyan
Write-Host ("Scanned images:          " + $qa.scanned_images)
Write-Host ("Imported images:         " + $qa.imported)
Write-Host ("Already represented:     " + $qa.duplicate_existing)
Write-Host ("Drive duplicates:        " + $qa.duplicate_within_drive)
Write-Host ("Attached to master:      " + $qa.attached_to_master)
Write-Host ("Drive archive unmatched: " + $qa.unassigned_archive)
Write-Host ("Wild + lab paired:       " + $qa.pairing_complete_count + " / 422")
Write-Host ("Missing wild records:    " + $qa.missing_wild_codes.Count)
Write-Host ("Missing lab records:     " + $qa.missing_lab_codes.Count)
Write-Host ("Failed files:            " + $qa.failed.Count)
Write-Host ("All source represented:  " + $qa.all_source_images_represented)

if (-not $qa.all_source_images_represented) {
  Fail "Not every source image is represented. Deployment stopped intentionally."
}

Write-Host ""
Write-Host "Staging complete import..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) { Fail "git add failed." }

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace(($changes -join ""))) {
  Write-Host "No new files to commit. The repository already matches the completed import." -ForegroundColor Green
} else {
  git commit -m "Import and pair complete Rutgers Google Drive photo archive"
  if ($LASTEXITCODE -ne 0) { Fail "git commit failed." }
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Fail "git push failed." }

Write-Host ""
Write-Host "SUCCESS: Complete Rutgers photo import pushed to GitHub." -ForegroundColor Green
Write-Host "Render Auto-Deploy should now publish the new commit." -ForegroundColor Green
Write-Host ""
Write-Host "Review DRIVE_IMPORT_QA.json for every remaining missing wild/lab pairing." -ForegroundColor Cyan
