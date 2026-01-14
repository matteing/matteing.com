import { getPlaiceholder } from "plaiceholder";
import sharp from "sharp";

export async function getBlurFromRemoteSource(src: string) {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );

    const {
      metadata: { height, width },
      ...plaiceholder
    } = await getPlaiceholder(buffer, { size: 10 });

    return {
      ...plaiceholder,
      img: { src, height, width },
    };
  } catch (e) {
    console.error("Error generating blur:", e);
    // Return a fallback or empty object to prevent crashing
    return {
      base64: "",
      img: { src, height: 0, width: 0 },
    };
  }
}

/**
 * Extract the dominant color from an image URL
 * Uses sharp to resize and get stats for the most common color
 */
export async function getDominantColor(src: string): Promise<string | null> {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );

    // Resize to 1x1 pixel to get average/dominant color
    const { data } = await sharp(buffer)
      .resize(1, 1, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // data is a Buffer with [r, g, b] or [r, g, b, a] depending on channels
    const r = data[0];
    const g = data[1];
    const b = data[2];
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    console.error("Error extracting dominant color:", e);
    return null;
  }
}
