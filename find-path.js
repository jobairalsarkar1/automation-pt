import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "picturetv",
  api_key: "255698863444547",
  api_secret: "8bwtyfPj-gTlv8Nabkfjtn1nioI",
});

async function findImagesByKeyword(keyword) {
  let nextCursor = null;
  let found = [];

  do {
    const res = await cloudinary.v2.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: 500,
      next_cursor: nextCursor,
    });

    found.push(
      ...res.resources.filter((r) =>
        r.public_id.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    nextCursor = res.next_cursor;
  } while (nextCursor);

  console.log(`Found ${found.length} images containing '${keyword}':`);
  found.slice(0, 20).forEach((r) => console.log(r.public_id));
}

const keyword = process.argv[2] || "gnossem"; // get from command line or default
findImagesByKeyword(keyword).catch(console.error);
