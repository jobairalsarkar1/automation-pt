import fs from "fs-extra";
import path from "path";

async function generateFolderData() {
  const downloadsDir = path.join(process.cwd(), "downloads");
  const dataDir = path.join(process.cwd(), "data");
  const foldersDataDir = path.join(dataDir, "folders");

  // Verify downloads directory exists
  if (!(await fs.pathExists(downloadsDir))) {
    console.error(`Downloads directory does not exist at: ${downloadsDir}`);
    process.exit(1);
  }

  // Create data directories
  await fs.ensureDir(foldersDataDir);

  // Get all folder names
  const folders = (await fs.readdir(downloadsDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const summaryData = {};

  // Process each folder
  for (const folder of folders) {
    const folderPath = path.join(downloadsDir, folder);
    const files = (await fs.readdir(folderPath, { withFileTypes: true }))
      .filter((f) => f.isFile())
      .map((f) => ({
        name: f.name,
        fullPath: path.join(folderPath, f.name).replace(/\\/g, "/"),
      }));

    // Create folder-specific data
    const folderData = {
      folderName: folder,
      folderPath: folderPath.replace(/\\/g, "/"),
      totalImages: files.length,
      images: files.map((file) => ({
        fileName: file.name,
        fullPath: file.fullPath,
      })),
    };

    // Save individual folder JSON
    const folderJsonPath = path.join(foldersDataDir, `${folder}.json`);
    await fs.writeJson(folderJsonPath, folderData, { spaces: 2 });
    console.log(`✅ Created ${folder}.json`);

    // Add to summary data
    summaryData[folder] = {
      path: folderPath.replace(/\\/g, "/"),
      imageCount: files.length,
      images: files.map((f) => f.name),
    };
  }

  // Save summary JSON
  const summaryPath = path.join(dataDir, "summary.json");
  await fs.writeJson(summaryPath, summaryData, { spaces: 2 });
  console.log(`\n✅ Summary created at ${summaryPath}`);
}

generateFolderData().catch(console.error);
