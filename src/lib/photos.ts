import type { ImageMetadata } from 'astro';

// Every photo dropped into src/photos/ (see PHOTOS.txt), keyed by its name
// without the extension: "richa", "thor", "lens/3".
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const name = path.replace('../photos/', '').replace(/\.[^.]+$/, '').toLowerCase();
  byName.set(name, mod.default);
}

export const photo = (name: string) => byName.get(name.toLowerCase());

// Lens photos in natural order (2 before 10), however many there are.
export const lensPhotos = () =>
  [...byName]
    .filter(([name]) => name.startsWith('lens/'))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, img]) => img);
