const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const dirPath = path.join(__dirname, 'secret-folder');
async function readFilesInDir() {
  try {
    const files = await readdir(dirPath, { withFileTypes: true });
    files.forEach(file => {
      if (!file.isDirectory()) {
        let filePath = path.join(__dirname, 'secret-folder', file.name);
        let fileObj = path.parse(filePath);
        fs.stat(filePath, (err, stats) => {
          console.log(`${fileObj.name} - ${fileObj.ext.split('.')[1]} - ${stats.size / 1024} kb`);
        });
      }
    });
  } catch (err) {
    console.error(err);
  }
}
readFilesInDir();