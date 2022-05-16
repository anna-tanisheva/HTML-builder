const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const { readdir } = require('fs/promises');
const srcPath = path.join(__dirname, 'files');
const destPath = path.join(__dirname, 'files-copy');
fsPromises.mkdir(destPath, { recursive: true });
removeFiles();
async function copyFileFromDir(fileName) {
  try {
    let fullSrcPath = path.join(srcPath, fileName);
    let fullDestPath = path.join(destPath, fileName);
    await fsPromises.copyFile(fullSrcPath, fullDestPath);
  } catch (err) {
    console.error(err);
  }
}
async function removeFiles() {
  try {
    const files = await readdir(destPath, { withFileTypes: true });
    files.forEach(file => {
      fs.unlink(path.join(destPath, file.name), err => {
        if (err) throw err;
      });
    });
  } catch (err) {
    console.error(err);
  }
}
async function readFilesInDir() {
  try {
    const files = await readdir(srcPath, { withFileTypes: true });
    files.forEach(file => {
      copyFileFromDir(file.name);
    });
  } catch (err) {
    console.error(err);
  }
}
readFilesInDir();

