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
        let filePath = path.join(inputPath, file.name);
        let fileObj = path.parse(filePath);
        if (fileObj.ext === '.css') {
          let styles = '';
          const input = fs.createReadStream(filePath, 'utf-8');
          input.on('data', chunk => styles += chunk);
          input.on('end', () => {
            output.write(styles);
            output.write('\n');
          });
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}
readFilesInDir();