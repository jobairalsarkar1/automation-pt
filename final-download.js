import cloudinary from "cloudinary";
import axios from "axios";
import fs from "fs-extra";
import path from "path";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: "picturetv",
  api_key: "255698863444547",
  api_secret: "8bwtyfPj-gTlv8Nabkfjtn1nioI",
});

/**
 * Downloads a single image from a given URL to a given file path
 */
async function downloadImage(url, filepath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await fs.outputFile(filepath, res.data);
  console.log(`✅ Saved: ${filepath}`);
}

/**
 * Downloads all images from Cloudinary that match a given prefix
 * @param {string} prefix - The folder name or naming pattern (e.g., "APA", "GNOSSEM", "MY_FOLDER/IMG")
 */
async function downloadFromFolder(prefix) {
  let nextCursor = null;
  let allResources = [];

  do {
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: prefix, // Prefix can be a folder or name pattern
      max_results: 500,
      next_cursor: nextCursor,
    });

    allResources = allResources.concat(result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`📦 Found ${allResources.length} images for prefix: "${prefix}"`);

  // Make local folder based on prefix (replace slashes with underscores)
  const localFolderName = prefix.replace(/\//g, "_");
  fs.ensureDirSync(`downloads/${localFolderName}`);

  for (const img of allResources) {
    const fileName = path.basename(img.public_id) + "." + img.format;
    const filePath = path.join(`downloads/${localFolderName}`, fileName);
    await downloadImage(img.secure_url, filePath);
  }

  console.log(
    `✅✅ All images for "${prefix}" downloaded to downloads/${localFolderName}`
  );
}

const prefix = process.argv[2] || "NYFW";
downloadFromFolder(prefix).catch(console.error); // Example: "APA" or "GNOSSEM" or "myfolder/"
