Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'assets/mini-logo.png'
$outputDir = Join-Path $projectRoot 'assets/logo-yuvarlak-alternatifleri'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$originalMark = [System.Drawing.Bitmap]::new($sourcePath)
$mark = [System.Drawing.Bitmap]::new($originalMark.Width, $originalMark.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $originalMark.Height; $y++) {
    for ($x = 0; $x -lt $originalMark.Width; $x++) {
        $pixel = $originalMark.GetPixel($x, $y)
        $gray = [Math]::Abs($pixel.R - $pixel.G) -lt 25 -and [Math]::Abs($pixel.G - $pixel.B) -lt 25
        if ($pixel.A -gt 0 -and $gray -and $pixel.R -lt 180) {
            $pixel = [System.Drawing.Color]::FromArgb($pixel.A, 18, 18, 18)
        }
        $mark.SetPixel($x, $y, $pixel)
    }
}
$originalMark.Dispose()
$ink = [System.Drawing.Color]::FromArgb(24, 24, 24)
$orange = [System.Drawing.Color]::FromArgb(242, 146, 0)
$white = [System.Drawing.Color]::White

function New-Canvas {
    $bitmap = [System.Drawing.Bitmap]::new(1080, 1080, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $clip.AddEllipse(0, 0, 1079, 1079)
    $graphics.SetClip($clip)
    $brush = [System.Drawing.SolidBrush]::new($white)
    $graphics.FillEllipse($brush, 0, 0, 1079, 1079)
    $brush.Dispose()
    return @{ Bitmap = $bitmap; Graphics = $graphics; Clip = $clip }
}

function Add-Ring($graphics, $color, $inset, $thickness) {
    $pen = [System.Drawing.Pen]::new($color, $thickness)
    $diameter = 1079 - 2 * $inset
    $graphics.DrawEllipse($pen, $inset, $inset, $diameter, $diameter)
    $pen.Dispose()
}

function Add-Mark($graphics, $x, $y, $width) {
    $height = [int][Math]::Round($mark.Height * $width / $mark.Width)
    $graphics.DrawImage($mark, [System.Drawing.Rectangle]::new($x, $y, $width, $height))
}

function Add-CenteredText($graphics, $text, $family, $size, $style, $color, $rect) {
    $font = [System.Drawing.Font]::new($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new($color)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString($text, $font, $brush, $rect, $format)
    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

function Add-TrackedText($graphics, $text, $family, $size, $style, $color, $centerX, $y, $tracking) {
    $font = [System.Drawing.Font]::new($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new($color)
    $format = [System.Drawing.StringFormat]::GenericTypographic
    $widths = @()
    foreach ($letter in $text.ToCharArray()) {
        $widths += $graphics.MeasureString([string]$letter, $font, 1000, $format).Width
    }
    $total = ($widths | Measure-Object -Sum).Sum + $tracking * ($text.Length - 1)
    $x = $centerX - $total / 2
    for ($i = 0; $i -lt $text.Length; $i++) {
        $graphics.DrawString([string]$text[$i], $font, $brush, [System.Drawing.PointF]::new([float]$x, [float]$y), $format)
        $x += $widths[$i] + $tracking
    }
    $brush.Dispose()
    $font.Dispose()
}

function Add-Line($graphics, $color, $width, $x1, $y1, $x2, $y2) {
    $pen = [System.Drawing.Pen]::new($color, $width)
    $graphics.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
}

function Save-Canvas($canvas, $fileName) {
    $path = Join-Path $outputDir $fileName
    $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Graphics.Dispose()
    $canvas.Clip.Dispose()
    $canvas.Bitmap.Dispose()
    Write-Output $path
}

try {
    # 01: Klasik çift halkalı mühür.
    $c = New-Canvas
    Add-Ring $c.Graphics $ink 20 5
    Add-Ring $c.Graphics $orange 43 2
    Add-Mark $c.Graphics 315 172 450
    Add-CenteredText $c.Graphics 'ŞAHİNKAYA' 'Palatino Linotype' 94 ([System.Drawing.FontStyle]::Bold) $ink ([System.Drawing.RectangleF]::new(154, 632, 772, 118))
    Add-TrackedText $c.Graphics 'MOBİLYA' 'Century Gothic' 52 ([System.Drawing.FontStyle]::Regular) $ink 540 759 15
    Add-Line $c.Graphics $orange 3 374 848 706 848
    Save-Canvas $c '01-klasik-muhur.png'

    # 02: Daha güçlü simge ve sade modern tipografi.
    $c = New-Canvas
    Add-Ring $c.Graphics $ink 18 5
    Add-Mark $c.Graphics 285 138 510
    Add-CenteredText $c.Graphics 'ŞAHİNKAYA' 'Bahnschrift SemiBold' 100 ([System.Drawing.FontStyle]::Regular) $ink ([System.Drawing.RectangleF]::new(142, 600, 796, 120))
    Add-Line $c.Graphics $orange 8 328 735 752 735
    Add-TrackedText $c.Graphics 'MOBİLYA' 'Bahnschrift' 54 ([System.Drawing.FontStyle]::Regular) $ink 540 770 16
    Save-Canvas $c '02-modern.png'

    # 03: Yazı önde, küçük imzalı editoryal düzen.
    $c = New-Canvas
    Add-Ring $c.Graphics $ink 25 3
    Add-Mark $c.Graphics 366 178 348
    Add-CenteredText $c.Graphics 'ŞAHİNKAYA' 'Georgia' 98 ([System.Drawing.FontStyle]::Regular) $ink ([System.Drawing.RectangleF]::new(126, 525, 828, 124))
    Add-Line $c.Graphics $orange 3 220 705 372 705
    Add-Line $c.Graphics $orange 3 708 705 860 705
    Add-TrackedText $c.Graphics 'MOBİLYA' 'Century Gothic' 52 ([System.Drawing.FontStyle]::Regular) $ink 540 675 11
    Save-Canvas $c '03-editorial.png'

    # 04: Üstü açık, altı koyu iki alanlı profil rozeti.
    $c = New-Canvas
    $darkBrush = [System.Drawing.SolidBrush]::new($ink)
    $c.Graphics.FillRectangle($darkBrush, 0, 612, 1080, 468)
    $darkBrush.Dispose()
    Add-Ring $c.Graphics $ink 14 5
    Add-Mark $c.Graphics 300 145 480
    Add-Line $c.Graphics $orange 10 164 613 916 613
    Add-CenteredText $c.Graphics 'ŞAHİNKAYA' 'Bahnschrift SemiBold' 100 ([System.Drawing.FontStyle]::Regular) $white ([System.Drawing.RectangleF]::new(150, 648, 780, 125))
    Add-TrackedText $c.Graphics 'MOBİLYA' 'Century Gothic' 55 ([System.Drawing.FontStyle]::Regular) $white 540 798 15
    Save-Canvas $c '04-iki-ton.png'

    # 05: Yuvarlak kimliğin içindeki koyu isim bandı.
    $c = New-Canvas
    Add-Ring $c.Graphics $ink 16 5
    Add-Mark $c.Graphics 320 135 440
    $bandBrush = [System.Drawing.SolidBrush]::new($ink)
    $c.Graphics.FillRectangle($bandBrush, 0, 618, 1080, 166)
    $bandBrush.Dispose()
    Add-CenteredText $c.Graphics 'ŞAHİNKAYA' 'Palatino Linotype' 91 ([System.Drawing.FontStyle]::Bold) $white ([System.Drawing.RectangleF]::new(136, 632, 808, 138))
    Add-TrackedText $c.Graphics 'MOBİLYA' 'Century Gothic' 58 ([System.Drawing.FontStyle]::Regular) $ink 540 814 14
    Save-Canvas $c '05-isim-bandi.png'
}
finally {
    $mark.Dispose()
}

$files = @(
    '01-klasik-muhur.png',
    '02-modern.png',
    '03-editorial.png',
    '04-iki-ton.png',
    '05-isim-bandi.png'
)
$names = @('01  KLASİK MÜHÜR', '02  MODERN', '03  EDİTORYAL', '04  İKİ TON', '05  İSİM BANDI')
$background = [System.Drawing.Color]::FromArgb(243, 243, 241)
$inkBrush = [System.Drawing.SolidBrush]::new($ink)
$whiteBrush = [System.Drawing.SolidBrush]::new($white)
$cardPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(218, 218, 215), 2)
$titleFont = [System.Drawing.Font]::new('Arial', 37, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$labelFont = [System.Drawing.Font]::new('Arial', 25, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

try {
    $sheet = [System.Drawing.Bitmap]::new(1900, 1380)
    $graphics = [System.Drawing.Graphics]::FromImage($sheet)
    $graphics.Clear($background)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $graphics.DrawString('ŞAHİNKAYA MOBİLYA  |  YUVARLAK PROFİL LOGOLARI', $titleFont, $inkBrush, 90, 42)
    for ($i = 0; $i -lt 5; $i++) {
        if ($i -lt 3) {
            $x = 85 + $i * 585
            $y = 140
        }
        else {
            $x = 385 + ($i - 3) * 585
            $y = 750
        }
        $graphics.FillRectangle($whiteBrush, $x, $y, 550, 560)
        $graphics.DrawRectangle($cardPen, $x, $y, 550, 560)
        $image = [System.Drawing.Image]::FromFile((Join-Path $outputDir $files[$i]))
        $graphics.DrawImage($image, [System.Drawing.Rectangle]::new($x + 30, $y + 20, 490, 490))
        $graphics.DrawString($names[$i], $labelFont, $inkBrush, $x + 30, $y + 510)
        $image.Dispose()
    }
    $sheet.Save((Join-Path $outputDir 'karsilastirma.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $sheet.Dispose()

    $preview = [System.Drawing.Bitmap]::new(1300, 300)
    $graphics = [System.Drawing.Graphics]::FromImage($preview)
    $graphics.Clear($background)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    for ($i = 0; $i -lt 5; $i++) {
        $x = 72 + $i * 250
        $image = [System.Drawing.Image]::FromFile((Join-Path $outputDir $files[$i]))
        $graphics.DrawImage($image, [System.Drawing.Rectangle]::new($x, 40, 170, 170))
        $graphics.DrawString(('0' + ($i + 1)), $labelFont, $inkBrush, $x + 68, 230)
        $image.Dispose()
    }
    $preview.Save((Join-Path $outputDir 'profil-onizleme.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $preview.Dispose()
}
finally {
    $labelFont.Dispose()
    $titleFont.Dispose()
    $cardPen.Dispose()
    $whiteBrush.Dispose()
    $inkBrush.Dispose()
}
