# Picture TV Automation

Picture TV Automation is a streamlined toolkit designed to manage image workflows with Cloudinary for Picture TV projects. It provides a suite of scripts to upload, organize, retrieve, and beautify image data efficiently.

---

## Features

- **Bulk Upload Images**  
  Upload entire folders of images with proper metadata using `bulk-imageUpload.js`.

- **Image Path Finder**  
  Locate specific image paths from Cloudinary easily with `find-path.js`.

- **Download Images in Bulk**  
  Download all images from a specified Cloudinary path using `final-download.js`.

- **Data Beautification**  
  Convert and format image metadata into clean JSON and CSV files via `generate-data.js`.

- **Folder-wise Data Decoration**  
  Generate prettified JSON files per image folder for organized data handling with `generate-folder-data.js`.

- **Cloudinary Connection Testing**  
  Verify your Cloudinary credentials and connection using `test.js`.

---

## File Overview

| Filename                  | Purpose                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `bulk-imageUpload.js`     | Upload images from a folder to Cloudinary with metadata.            |
| `final-download.js`       | Download images from a specified Cloudinary path in bulk.           |
| `find-path.js`            | Search and retrieve image paths of a specific type from Cloudinary. |
| `generate-data.js`        | Beautify and export image data into JSON and CSV formats.           |
| `generate-folder-data.js` | Prettify JSON data per folder to organize image installs.                      |
| `test.js`                 | Test script to confirm Cloudinary API connection.                   |

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- Cloudinary account with API credentials
