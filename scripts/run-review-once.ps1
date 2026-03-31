param(
    [Parameter(Mandatory = $true)]
    [string]$SlotLabel,

    [Parameter(Mandatory = $true)]
    [string]$ScheduledTime,

    [Parameter(Mandatory = $true)]
    [string]$OutputRoot
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$outputDir = Join-Path $OutputRoot $SlotLabel
$reportPath = Join-Path $outputDir 'report.md'
$metaPath = Join-Path $outputDir 'meta.json'
$logPath = Join-Path $outputDir 'runner.log'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$imagePaths = Get-ChildItem -Path $repoRoot -Filter '*.jpg' -File -ErrorAction SilentlyContinue |
    Sort-Object Name |
    Select-Object -ExpandProperty FullName

$prompt = @"
You are running one scheduled multi-agent review inside repository: $repoRoot

Hard requirements:
1. You must explicitly create a multi-agent team with at least 3 sub-agents working in parallel.
2. This review slot label is: $SlotLabel
3. This review was scheduled for: $ScheduledTime
4. Review only. Do not edit code. Do not change API contracts. Assume backend APIs are real and already connected.
5. Focus on core business flows, route transitions, state handling, error handling, and whether the UI matches the apparent product needs shown by the code and attached screenshots.
6. Core flows that must be covered: login/auth, cloud PC purchase or order creation, payment flow, cloud resources list/detail/renew/order pages, and user-center related entry points.
7. UI review should combine page implementation with the attached screenshots and call out missing states, weak hierarchy, inconsistent interactions, or likely broken presentation.
8. Findings come first. If no clear defect is found, explicitly say so and list residual risks and unverified areas.

Execution requirements:
- First inspect the codebase quickly, then split work across sub-agents.
- Suggested team split:
  - Agent A: core business flow, routing, state transitions
  - Agent B: login, payment, request wrappers, edge cases
  - Agent C: UI/page consistency review using screenshots
- Avoid duplicating the same inspection across agents.
- The main agent should merge, deduplicate, and rank findings by severity.

Output requirements:
- Final output must be Markdown only.
- Start with Findings. Every finding must include severity, impact, and file path with line reference or a precise location.
- Then list Open Questions / Residual Risks.
- End with a short Overall Assessment.
- Do not include unrelated chatter.
"@

$meta = [ordered]@{
    slot = $SlotLabel
    scheduled_time = $ScheduledTime
    started_at = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
    repo_root = $repoRoot
    report_path = $reportPath
    images = $imagePaths
}

$meta | ConvertTo-Json -Depth 4 | Set-Content -Path $metaPath -Encoding UTF8

$arguments = @(
    'exec',
    '--dangerously-bypass-approvals-and-sandbox',
    '--cd', $repoRoot,
    '--output-last-message', $reportPath,
    '-'
)

foreach ($imagePath in $imagePaths) {
    $arguments += @('--image', $imagePath)
}

"[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Starting review slot $SlotLabel" | Tee-Object -FilePath $logPath -Append
$prompt | & codex @arguments 2>&1 | Tee-Object -FilePath $logPath -Append
$exitCode = $LASTEXITCODE
"[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Finished review slot $SlotLabel with exit code $exitCode" | Tee-Object -FilePath $logPath -Append

if ($exitCode -ne 0) {
    throw "Codex review failed for slot $SlotLabel with exit code $exitCode"
}
