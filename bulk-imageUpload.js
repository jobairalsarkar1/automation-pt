import { readFile } from "fs/promises";
import path from "path";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Static metadata - MATCHES FRONTEND STRUCTURE
const STATIC_METADATA = {
  name: "Launch Of GNOSSEM",
  description: "A large annual conference focusing on tech advancements.",
  capturedBy: "Maserati Of Manhattan With Timo Weiland",
  captureDate: new Date().toISOString(), // Frontend sends ISO string
  tags: "Party,Cocktail,Lunch", // Frontend sends comma-separated string
  price: "85",
  isForSale: "true",
  eventId: "6899094bb4fef29705dda902", // Frontend uses eventId
  authorId: "6896f37a93a1d284a9fc21ae", // Must be valid admin user ID
};

/**
 * Validates if a file exists
 */
async function validateFileExists(filePath) {
  try {
    await readFile(filePath);
  } catch (error) {
    throw new Error(`File not found: ${filePath}`);
  }
}

/**
 * Uploads image to Cloudinary with retries
 */
async function uploadToCloudinary(imagePath, folderName, retries = 3) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: `picture-tv/images/${folderName}`,
    });

    return {
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      thumbnailUrl: result.secure_url.replace(
        "/upload/",
        "/upload/c_fill,w_300,h_300,q_auto:low/"
      ),
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying upload (${retries} left)...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return uploadToCloudinary(imagePath, folderName, retries - 1);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Saves metadata to database - MATCHES FRONTEND EXACTLY
 */
async function saveToDatabase(metadata) {
  try {
    const response = await axios.post(
      "https://www.picturetv.net/api/dashboard/images",
      {
        ...metadata,
        // No transformations needed - matches frontend format
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    console.error("API Error Details:", JSON.stringify(errorData, null, 2));
    throw error;
  }
}

/**
 * Main processing function
 */
async function processImages(jsonFilePath) {
  let successCount = 0;
  let failCount = 0;

  try {
    // Validate JSON file
    await validateFileExists(jsonFilePath);
    const data = JSON.parse(await readFile(jsonFilePath, "utf8"));

    if (!data.folderName || !data.images) {
      throw new Error('Invalid JSON: Missing "folderName" or "images"');
    }

    console.log(`Starting upload of ${data.images.length} images...`);

    // Process each image
    for (const [index, image] of data.images.entries()) {
      try {
        console.log(
          `\n[${index + 1}/${data.images.length}] Processing: ${image.fileName}`
        );

        // Validate image exists
        await validateFileExists(image.fullPath);

        // Upload to Cloudinary
        const { imageUrl, cloudinaryId, thumbnailUrl } =
          await uploadToCloudinary(image.fullPath, data.folderName);

        // Prepare metadata (EXACT frontend format)
        const metadata = {
          ...STATIC_METADATA,
          name: path.parse(image.fileName).name.replace(/_/g, " "),
          imageUrl,
          cloudinaryId,
          thumbnailUrl,
        };

        console.log("Sending data:", JSON.stringify(metadata, null, 2));

        // Save to database
        await saveToDatabase(metadata);
        console.log("✅ Saved successfully");
        successCount++;

        // Rate limiting
        if (index < data.images.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`❌ Failed ${image.fileName}:`, error.message);
        failCount++;
      }
    }

    console.log(
      `\nFinal result: ${successCount} succeeded, ${failCount} failed`
    );
  } catch (error) {
    console.error("\nFatal Error:", error.message);
    process.exit(1);
  }
}

// Run script
const jsonFile = process.argv[2];
if (!jsonFile) {
  console.error("Usage: node uploadImages.js <path-to-json>");
  process.exit(1);
}

processImages(jsonFile);
