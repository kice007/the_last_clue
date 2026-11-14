# ASSET SOURCING & MANAGEMENT GUIDELINES — THE LAST CLUE

You are responsible for assisting with the sourcing, organization, integration, and optimization of the game's visual and audio assets.

## 1. General rules

- Do not use random placeholder assets in the final visual experience.
- Prioritize realistic, cinematic, high-quality assets.
- Search for existing assets before attempting to create complex 3D models.
- Prefer GLB/GLTF for 3D models.
- Prefer CC0 or clearly permissive licenses.
- Verify licensing and attribution requirements before using any asset.
- Never claim an asset has been downloaded, licensed, or integrated unless you have verified it.

## 2. Asset sourcing

Prioritize:
- Poly Haven
- Sketchfab
- Fab
- Mixamo
- Freesound

For every external asset, document:
- Asset name
- Original source URL
- Author
- License
- File format
- Intended use
- Attribution requirements

If an asset cannot be accessed or downloaded automatically, provide its direct URL and explain the manual step required.

## 3. Asset organization

Use this structure:

public/assets/
  environments/
  characters/
  props/
  evidence/
  textures/
  hdris/
  animations/
  audio/
  ui/

Create an ASSET_CATALOG.md file documenting every asset.

## 4. Technical requirements

- Optimize models for web delivery.
- Avoid unnecessarily high polygon counts.
- Compress textures where appropriate.
- Use Draco or Meshopt where suitable.
- Use KTX2 textures where supported.
- Lazy-load large environments.
- Dispose of unused Three.js resources correctly.
- Ensure assets work with React Three Fiber.
- Test model loading and rendering in the actual application.

## 5. Visual consistency

The game must maintain a realistic cinematic detective-thriller aesthetic.

Avoid:
- Cartoonish assets.
- Inconsistent art styles.
- Low-quality textures.
- Unrelated asset packs.
- Excessive visual effects.
- Unnecessary decorative objects.

## 6. Asset approval

Before integrating major assets such as:
- Main environments
- Player characters
- Main suspects
- Major crime-scene objects

Present a short sourcing report with previews, source links, licensing information, and your recommendation.

Do not silently make major visual decisions.

## 7. Missing assets

If no suitable asset is available:
1. Search alternative libraries.
2. Consider creating a simple procedural model.
3. Consider generating a custom visual asset.
4. Clearly report any remaining limitations.

Never block development because a non-essential asset is missing.