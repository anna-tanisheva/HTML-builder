const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { readdir } = require('fs/promises');


//copy assets
const projectBundlePath = path.join(__dirname, 'project-dist');
const srcAssetsPath = path.join(__dirname, 'assets');
const destAssetsPath = path.join(__dirname, 'project-dist', 'assets');
fsPromises.mkdir(projectBundlePath, { recursive: true });
fsPromises.mkdir(destAssetsPath, { recursive: true });

copyAssetsStructure();
async function copyAssetsStructure() {
  try {
    const assetsStructure = await readdir(srcAssetsPath);
    assetsStructure.forEach(dir => {
      fsPromises.mkdir(path.join(destAssetsPath, dir), { recursive: true });
      copyAssetsContent(dir, srcAssetsPath, destAssetsPath);
    });
  } catch (err) {
    console.log(err);
  }
}


async function copyAssetsContent(dir, srcPath, destPath) {
  let fullSrcPath = path.join(srcPath, dir);
  let fullDestPath = path.join(destPath, dir);
  fs.readdir(fullDestPath, (err, files) => {
    if (err) console.log(err);
    for (const file of files) {
      if (file) {
        fs.unlink(path.join(fullDestPath, file), err => {
          if (err) throw err;
        });
      }
    }
  });
  const assetsContent = await readdir(fullSrcPath, { withFileTypes: true });
  assetsContent.forEach(file => {
    copyFileFromDir(file.name, fullSrcPath, fullDestPath);
  });
}

async function copyFileFromDir(fileName, fullSrcPath, fullDestPath) {
  let fullSrcPathFile = path.join(fullSrcPath, fileName);
  let fullDestPathFile = path.join(fullDestPath, fileName);
  try {
    await fsPromises.copyFile(fullSrcPathFile, fullDestPathFile);
  } catch (err) {
    console.error(err);
  }
}
copyAssetsStructure();

// merge styles

const inputPath = path.join(__dirname, 'styles');
const outputPath = path.join(__dirname, 'project-dist');
const outputCss = fs.createWriteStream(path.join(outputPath, 'style.css'));

async function readFilesInDir() {
  try {
    const files = await readdir(inputPath, { withFileTypes: true });
    files.forEach((file) => {
      // console.log(file);
      if (!file.isDirectory()) {
        let filePath = path.join(__dirname, 'styles', file.name);
        let fileObj = path.parse(filePath);
        if (fileObj.ext === '.css') {
          let styles = '';
          const input = fs.createReadStream(filePath, 'utf-8');
          input.on('data', chunk => styles += chunk);
          input.on('end', () => {
            outputCss.write(styles);
            outputCss.write('\n\n');
          });
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}
readFilesInDir();


//create html
const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const outputPathHtml = path.join(__dirname, 'project-dist', 'index.html');

fs.readFile(templatePath, (err, data) => {
  let template;
  if (err) console.log(err);
  template = data.toString();
  (
    async () => {
      const files = await readdir(componentsPath, { withFileTypes: true });
      files.forEach(file => {
        let fileName = file.name.split('.')[0];
        let componentRStream = fs.createReadStream(path.join(componentsPath, file.name));
        let componentData = '';
        componentRStream.on('data', chunk => componentData += chunk);
        componentRStream.on('end', () => {
          if (fileName) {
            template = template.replace(`{{${fileName}}}`, componentData);
          }
          let ws = fs.createWriteStream(outputPathHtml);
          ws.write(template);
        });
      });
    }
  )();
});
