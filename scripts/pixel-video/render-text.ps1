# ASCII-only on purpose: Thai strings live in lines.json (UTF-8), never in this file.
# Renders each line to white RGBA raw bytes; the compositor tints them later.
Add-Type -AssemblyName System.Drawing

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $here 'text'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$json = [System.IO.File]::ReadAllText((Join-Path $here 'lines.json'), [System.Text.Encoding]::UTF8)
$lines = $json | ConvertFrom-Json

$fontName = 'Leelawadee UI'
$index = @()

# scratch surface just for measuring
$mb = New-Object System.Drawing.Bitmap 8, 8
$mg = [System.Drawing.Graphics]::FromImage($mb)
$mg.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

foreach ($ln in $lines) {
    $font = New-Object System.Drawing.Font($fontName, [float]$ln.size, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fmt = [System.Drawing.StringFormat]::GenericTypographic.Clone()
    $fmt.FormatFlags = 0

    $sz = $mg.MeasureString($ln.text, $font, 4000, $fmt)
    $w = [int][Math]::Ceiling($sz.Width) + 8
    $h = [int][Math]::Ceiling($sz.Height) + 8

    $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.DrawString($ln.text, $font, $brush, 4, 4, $fmt)
    $g.Flush()

    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bytes = New-Object byte[] ($data.Stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
    $bmp.UnlockBits($data)

    [System.IO.File]::WriteAllBytes((Join-Path $outDir ($ln.id + '.bin')), $bytes)
    $index += [PSCustomObject]@{ id = $ln.id; w = $w; h = $h; stride = $data.Stride }

    $brush.Dispose(); $g.Dispose(); $bmp.Dispose(); $font.Dispose()
    Write-Output ("{0}: {1}x{2}" -f $ln.id, $w, $h)
}

$mg.Dispose(); $mb.Dispose()
$idxPath = Join-Path $outDir 'index.json'
[System.IO.File]::WriteAllText($idxPath, ($index | ConvertTo-Json -Compress), (New-Object System.Text.UTF8Encoding($false)))
Write-Output "wrote $idxPath"
