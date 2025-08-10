import fs from "fs-extra";
import path from "path";
import { stringify } from "csv-stringify/sync";

async function generateDataFiles() {
  const downloadsDir = path.join(process.cwd(), "downloads");
  const dataDir = path.join(process.cwd(), "data");

  // Makes sure downloads directory exists
  if (!(await fs.pathExists(downloadsDir))) {
    console.error(`Downloads directory does not exist at: ${downloadsDir}`);
    process.exit(1);
  }

  // Read all folders inside downloads
  const folders = (await fs.readdir(downloadsDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const data = {};
  const csvRows = [];

  for (const folder of folders) {
    const folderPath = path.join(downloadsDir, folder);

    // Read files in this folder
    const files = (await fs.readdir(folderPath, { withFileTypes: true }))
      .filter((f) => f.isFile())
      .map((f) => f.name);

    data[folder] = {
      total_images: files.length,
      images: files,
    };

    // Prepare CSV rows
    files.forEach((filename) => {
      csvRows.push({ folder, image: filename });
    });
  }

  // Ensure data folder exists
  await fs.ensureDir(dataDir);

  // Write JSON file
  const jsonPath = path.join(dataDir, "folders.json");
  await fs.writeJson(jsonPath, data, { spaces: 2 });
  console.log(`✅ JSON saved to ${jsonPath}`);

  // Write CSV file
  const csvPath = path.join(dataDir, "folders.csv");
  const csvString = stringify(csvRows, {
    header: true,
    columns: ["folder", "image"],
  });
  await fs.writeFile(csvPath, csvString);
  console.log(`✅ CSV saved to ${csvPath}`);
}

generateDataFiles().catch(console.error);
