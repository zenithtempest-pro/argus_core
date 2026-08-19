$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$presentation = $ppt.Presentations.Add()

# 16:9 Widescreen Configuration (960 x 540 pt)
$presentation.PageSetup.SlideWidth = 960
$presentation.PageSetup.SlideHeight = 540

# Color Palette (BGR Hex format for COM)
$COLOR_BG_DARK     = 0x160D09   # Deep slate #090D16
$COLOR_CARD_BG     = 0x2E1B13   # Surface card #131B2E
$COLOR_CARD_BORDER = 0x3B291E   # Border line #1E293B
$COLOR_TEXT_WHITE  = 0xFCFAF8   # Text white #F8FAFC
$COLOR_TEXT_MUTED  = 0xB8A394   # Muted gray #94A3B8
$COLOR_ACCENT_BLUE = 0xEB6325   # Royal blue #2563EB

$deckData = @(
    @{
        Category = "PROJECT OVERVIEW"
        Title    = "ArgusCore Intelligence & Diagnostics"
        Subtitle = "Unified OSINT, Network Diagnostics, and Automation Platform"
        Bullets  = @(
            "Comprehensive passive reconnaissance across Identity, Network, and Media.",
            "Integrated MXToolbox-grade diagnostics with real-time RBL and DNS verification.",
            "Dynamic Python script repository hub with automated SHA-256 integrity checks.",
            "Engineered with Light/Dark UX, non-blocking async sockets, and RBAC admin controls."
        )
    },
    @{
        Category = "PROBLEM STATEMENT"
        Title    = "Problem Statement & Market Need"
        Subtitle = "Eliminating tool fragmentation and performance issues"
        Bullets  = @(
            "Investigators are forced to switch across 10+ disjointed external sites.",
            "Synchronous network sockets hang and freeze traditional diagnostic tools.",
            "Lack of unified +91 Indian telecom circle and carrier attribution engines.",
            "Need for a verified, secure distribution hub for offline automation scripts."
        )
    },
    @{
        Category = "CORE OSINT"
        Title    = "Core Reconnaissance Suite"
        Subtitle = "Multi-target intelligence gathering"
        Bullets  = @(
            "Multi-Platform Username Hunter probing 25+ major social networks concurrently.",
            "Indian Phone (+91) Engine with TRAI/DoT 22-circle mapping and carrier attribution.",
            "EXIF Metadata extractor & GPS forensic scrubber for uploaded media.",
            "Automated document dorking engine for targeted PDF, DOCX, and PPTX reconnaissance."
        )
    },
    @{
        Category = "NETWORK DIAGNOSTICS"
        Title    = "MXToolbox-Grade Diagnostic Suite"
        Subtitle = "Deep email security & server reputation"
        Bullets  = @(
            "Universal SuperTool command bar with automated prefix cleaning (mx:, blacklist:, etc.).",
            "Multi-RBL reputation lookup across 100+ DNSBLs (Spamhaus, Barracuda, SORBS).",
            "RFC 7489 DMARC, SPF, DKIM, and BIMI policy compliance validation.",
            "RFC 822 Email Header hop, transit latency, and spam metric analyzer."
        )
    },
    @{
        Category = "GOVERNANCE & ARCHITECTURE"
        Title    = "System Architecture & Security"
        Subtitle = "High-performance full-stack design"
        Bullets  = @(
            "Next.js App Router with Light/Dark mode state persistence in localStorage.",
            "Non-blocking parallel queries (Promise.allSettled) with 3.5s timeouts.",
            "RBAC Admin control center at /admin with live audit logs and session monitoring.",
            "Official analyst support routing directly to supportarguscore@gmail.com."
        )
    }
)

foreach ($data in $deckData) {
    # 12 = ppLayoutBlank
    $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
    
    # 1. Slide Transition: Smooth Fade (1537 = ppTransitionFadeSmoothly, 1 = Fast)
    $slide.SlideShowTransition.EntryEffect = 1537
    $slide.SlideShowTransition.Speed = 1

    # 2. Slide Background Shape
    $bg = $slide.Shapes.AddShape(1, 0, 0, 960, 540) # 1 = msoShapeRectangle
    $bg.Fill.Solid()
    $bg.Fill.ForeColor.RGB = $COLOR_BG_DARK
    $bg.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

    # 3. Category Header Tag
    $catBox = $slide.Shapes.AddTextbox(1, 50, 35, 860, 25)
    $tfCat = $catBox.TextFrame
    $tfCat.TextRange.Text = $data.Category
    $tfCat.TextRange.Font.Name = "Segoe UI"
    $tfCat.TextRange.Font.Size = 11
    $tfCat.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $tfCat.TextRange.Font.Color.RGB = $COLOR_ACCENT_BLUE

    # 4. Slide Title
    $titleBox = $slide.Shapes.AddTextbox(1, 50, 60, 860, 45)
    $tfTitle = $titleBox.TextFrame
    $tfTitle.TextRange.Text = $data.Title
    $tfTitle.TextRange.Font.Name = "Segoe UI"
    $tfTitle.TextRange.Font.Size = 24
    $tfTitle.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $tfTitle.TextRange.Font.Color.RGB = $COLOR_TEXT_WHITE

    # 5. Slide Subtitle
    $subBox = $slide.Shapes.AddTextbox(1, 50, 105, 860, 30)
    $tfSub = $subBox.TextFrame
    $tfSub.TextRange.Text = $data.Subtitle
    $tfSub.TextRange.Font.Name = "Segoe UI"
    $tfSub.TextRange.Font.Size = 13
    $tfSub.TextRange.Font.Color.RGB = $COLOR_TEXT_MUTED

    # 6. Surface Card Container
    $card = $slide.Shapes.AddShape(1, 50, 145, 860, 345)
    $card.Fill.Solid()
    $card.Fill.ForeColor.RGB = $COLOR_CARD_BG
    $card.Line.ForeColor.RGB = $COLOR_CARD_BORDER
    $card.Line.Weight = 1.5

    # 7. Content Bullet List Box
    $contentBox = $slide.Shapes.AddTextbox(1, 80, 170, 800, 295)
    $tfContent = $contentBox.TextFrame
    $tfContent.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
    
    $bulletString = ($data.Bullets | ForEach-Object { "•   $_" }) -join "`n`n"
    $tfContent.TextRange.Text = $bulletString
    $tfContent.TextRange.Font.Name = "Segoe UI"
    $tfContent.TextRange.Font.Size = 14
    $tfContent.TextRange.Font.Color.RGB = $COLOR_TEXT_WHITE

    # 8. Animation: Fade In Card, then Fade In Content
    # 10 = msoAnimEffectFade, 1 = msoAnimTriggerWithPrevious, 2 = msoAnimTriggerAfterPrevious
    $null = $slide.TimeLine.MainSequence.AddEffect($card, 10, 0, 1)
    $null = $slide.TimeLine.MainSequence.AddEffect($contentBox, 10, 0, 2)
}

$outPath = Join-Path $PWD "ArgusCore_Presentation.pptx"
$presentation.SaveAs($outPath)
$presentation.Close()
$ppt.Quit()
[System.GC]::Collect()

Write-Host "Presentation generated cleanly with transitions and animations: $outPath" -ForegroundColor Green