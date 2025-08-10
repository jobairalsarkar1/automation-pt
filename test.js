import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "picturetv",
  api_key: "255698863444547",
  api_secret: "8bwtyfPj-gTlv8Nabkfjtn1nioI",
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
