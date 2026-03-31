param(
    [string]$Date = (Get-Date).ToString('yyyy-MM-dd'),
    [string[]]$Times = @('18:50', '19:30'),
    [string]$OutputBase = 'review-reports'
)

$ErrorActionPreference = 'Stop'

function Wait-Until {
    param(
        [Parameter(Mandatory = $true)]
        [datetime]$TargetTime
    )

    while ($true) {
        $now = Get-Date
        if ($now -ge $TargetTime) {
            return
        }

        $sleepSeconds = [math]::Min([int][math]::Ceiling(($TargetTime - $now).TotalSeconds), 30)
        Start-Sleep -Seconds $sleepSeconds
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$outputRoot = Join-Path $repoRoot $OutputBase
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$normalizedTimes = @(
    $Times |
        ForEach-Object { $_ -split ',' } |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ }
)

$schedule = foreach ($time in $normalizedTimes) {
    [pscustomobject]@{
        Label = ($time -replace ':', '')
        Target = [datetime]::ParseExact("$Date $time", 'yyyy-MM-dd HH:mm', $null)
    }
}

$runLog = Join-Path $outputRoot ("schedule-{0}.log" -f $Date.Replace(':', '-'))
"[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Review scheduler started for $Date" | Tee-Object -FilePath $runLog -Append

foreach ($slot in $schedule) {
    if ((Get-Date) -gt $slot.Target) {
        "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Skip slot $($slot.Label) because target time $($slot.Target.ToString('yyyy-MM-dd HH:mm:ss')) has passed" | Tee-Object -FilePath $runLog -Append
        continue
    }

    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Waiting for slot $($slot.Label) at $($slot.Target.ToString('yyyy-MM-dd HH:mm:ss'))" | Tee-Object -FilePath $runLog -Append
    Wait-Until -TargetTime $slot.Target

    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Triggering slot $($slot.Label)" | Tee-Object -FilePath $runLog -Append
    & (Join-Path $scriptDir 'run-review-once.ps1') `
        -SlotLabel $slot.Label `
        -ScheduledTime $slot.Target.ToString('yyyy-MM-dd HH:mm:ss zzz') `
        -OutputRoot $outputRoot 2>&1 | Tee-Object -FilePath $runLog -Append
}

"[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] Review scheduler finished" | Tee-Object -FilePath $runLog -Append
