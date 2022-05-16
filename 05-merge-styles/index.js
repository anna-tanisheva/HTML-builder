const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const inputPath = path.join(__dirname, 'styles');
const outputPath = path.join(__dirname, 'project-dist');
const output = fs.createWriteStream(path.join(outputPath, 'bundle.css'));

async function readFilesInDir() {
  try {
    const files = await readdir(inputPath, { withFileTypes: true });
    files.forEach((file) => {

      if (!file.isDirectory()) {
        let filePath = path.join(__dirname, 'styles', file.name);
        let fileObj = path.parse(filePath);
        if (fileObj.ext === '.css') {
          const input = fs.createReadStream(filePath, 'utf-8');
          input.on('data', chunk => output.write(chunk));
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}
readFilesInDir();