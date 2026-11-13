export function getImageUrl(image, fallback = "/souf.png") {
  if (!image) return fallback;
  if (typeof image === "string" && image.trim() !== "") return image;
  if (Array.isArray(image) && image.length > 0 && image[0]) return image[0];
  return fallback;
}