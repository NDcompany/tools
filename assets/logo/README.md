# Logo Assets

This directory contains the N&D Co. logo assets for the Tools Portal.

## Required Files

Place the following logo files in this directory:

1. **SYMBOL-DARK.png** - Logo for light mode (dark version)
   - Recommended size: 512x512px or 1024x1024px
   - Format: PNG with transparent background
   - Use case: Displayed when the site is in light mode

2. **SYMBOL-LIGHT.png** - Logo for dark mode (light version)
   - Recommended size: 512x512px or 1024x1024px
   - Format: PNG with transparent background
   - Use case: Displayed when the site is in dark mode

## Logo Behavior

- **Light Mode**: Shows `SYMBOL-DARK.png` (dark logo on light background)
- **Dark Mode**: Shows `SYMBOL-LIGHT.png` (light logo on dark background)
- Logos automatically switch when the theme toggle is clicked
- The switch is instant and synchronized with the theme change

## Size Guidelines

### Desktop
- Display size: 32px x 32px (2rem)
- Actual file: 512px x 512px minimum (for retina displays)

### Tablet (641px - 968px)
- Display size: 40px x 40px (2.5rem)

### Mobile (< 640px)
- Display size: 24px x 24px (1.5rem)

## Image Optimization

For best performance:
- Compress PNG files using tools like TinyPNG or ImageOptim
- Keep file size under 50KB per logo
- Use transparent backgrounds
- Ensure logo works well at small sizes

## Fallback

If logo images are not available, the text "N&D Co." will still display with a gradient effect.
