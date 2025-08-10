import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const folderPath = "decorated/APA";

cloudinary.v2.api
  .resources({
    type: "upload",
    resource_type: "image",
    prefix: folderPath + "/", // Search everything inside APA
    max_results: 500,
  })
  .then((result) => {
    console.log("Total returned:", result.resources.length);
    console.log("First few public_ids:");
    result.resources.slice(0, 5).forEach((r) => console.log(r.public_id));
  })
  .catch(console.error);
