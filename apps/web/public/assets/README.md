# Arc Tracker Assets

## Directory Structure

```
assets/
  fallback/
    bg-default.svg    <- Used when no arc-specific background exists
  arcs/
    consistency/
      bg-main.webp    <- Primary background (replace SVG placeholder with generated art)
      bg-alt.webp     <- Alternate background
      emblem.webp     <- Arc emblem/icon
    fat-loss/
      bg-main.webp
      ...
```

## Replacing Placeholder Art

The SVG files are development placeholders. To use generated manga-style art:

1. Generate images using the prompting strategy in the project spec
2. Save as `.webp` files in the appropriate arc folder
3. Update the arc's theme `backgroundImage` path if changing the extension
4. The `resolveBackgroundUrl()` helper handles fallbacks automatically

## Prompting Template

```
Create a manga-inspired UI background for a fitness/productivity app arc called "{ARC_NAME}".
Tone: disciplined, reflective, supportive, competitive.
No text. No characters with readable faces unless requested.
Leave negative space in center-right for UI cards.
Style: manga panel composition, dramatic lighting, clean ink-inspired shapes,
       subtle speed lines, limited color palette, modern app-friendly.
Aspect ratio: 16:9.
```
