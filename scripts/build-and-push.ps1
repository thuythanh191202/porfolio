$ErrorActionPreference = "Stop"

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "==> $Label" -ForegroundColor Cyan
    & $Command

    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed (exit code: $LASTEXITCODE)."
    }
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repositoryRoot

Invoke-CheckedCommand "Check Git repository" {
    git rev-parse --is-inside-work-tree
}

$branch = (git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Detached HEAD detected. Check out the main branch before deploying."
}

$remoteUrl = (git remote get-url origin 2>$null)
if ([string]::IsNullOrWhiteSpace($remoteUrl)) {
    throw "Remote 'origin' was not found. Connect the GitHub repository first."
}

Invoke-CheckedCommand "Sync dependencies from package-lock.json" {
    npm.cmd ci --prefer-offline --no-audit --no-fund
}

Invoke-CheckedCommand "Build website and optimize images" {
    npm.cmd run build
}

if (-not (Test-Path -LiteralPath "dist\index.html")) {
    throw "The build did not create dist\index.html. Deployment stopped."
}

Invoke-CheckedCommand "Stage Git changes" {
    git add --all
}

git diff --cached --quiet
$hasStagedChanges = $LASTEXITCODE -ne 0

if ($hasStagedChanges) {
    $commitMessage = "Deploy portfolio: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Invoke-CheckedCommand "Create commit '$commitMessage'" {
        git commit -m $commitMessage
    }
}
else {
    Write-Host ""
    Write-Host "No new files to commit. Existing commits will still be pushed." -ForegroundColor Yellow
}

Invoke-CheckedCommand "Push to origin/$branch" {
    git push origin $branch
}

Write-Host ""
Write-Host "Done: code was pushed and GitHub Actions is deploying GitHub Pages." -ForegroundColor Green
Write-Host "Track the deployment: https://github.com/thuythanh191202/porfolio/actions"
