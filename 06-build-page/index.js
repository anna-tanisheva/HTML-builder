const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { readdir } = require('fs/promises');

const PROJECT_BUNDLE_PATH = path.join(__dirname, 'project-dist');

const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const COMPONENTS_PATH = path.join(__dirname, 'components');
const OUTPUT_PATH_HTML = path.join(__dirname, 'project-dist', 'index.html');

const SRC_ASSETS_PATH = path.join(__dirname, 'assets');
const DEST_ASSETS_PATH = path.join(__dirname, 'project-dist', 'assets');

const INPUT_PATH_CSS = path.join(__dirname, 'styles');
const OUTPUT_PATH_CSS = path.join(__dirname, 'project-dist');
const outputCss = fs.createWriteStream(path.join(OUTPUT_PATH_CSS, 'style.css'));

fsPromises.mkdir(PROJECT_BUNDLE_PATH, { recursive: true }).then(() => {
  createIndexHtml();
  readFilesInDir();
});

//copy assets

fsPromises.mkdir(DEST_ASSETS_PATH, { recursive: true }).then(() => {
  clearDestAssets(DEST_ASSETS_PATH);
  copyAssets(SRC_ASSETS_PATH, DEST_ASSETS_PATH);
});

async function clearDestAssets(destPath) {
  try {
    const destDir = await readdir(destPath, { withFileTypes: true });
    destDir.forEach(dir => {
      if (dir.isDirectory()) {
        let underlyingDir = path.join(destPath, dir.name);
        clearDestAssets(underlyingDir);
      } else {
        fs.unlink(path.join(destPath, dir.name), err => {
          if (err) throw err;
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
}

async function copyAssets(pathToAssets, destPath) {
  try {
    const assetsStructure = await readdir(pathToAssets, { withFileTypes: true });
    assetsStructure.forEach(dir => {
      if (dir.isDirectory()) {
        fsPromises.mkdir(path.join(destPath, dir.name), { recursive: true });
        let pathToAssetsDir = path.join(pathToAssets, dir.name);
        let destAssetsDirPath = path.join(destPath, dir.name);
        copyAssets(pathToAssetsDir, destAssetsDirPath);
      } else {
        (async () => {
          try {
            let pathToFile = path.join(pathToAssets, dir.name);
            let destPathToFile = path.join(destPath, dir.name);
            await fsPromises.copyFile(pathToFile, destPathToFile);
          } catch (err) {
            console.error(err);
          }
        })();
      }
    });
  } catch (err) {
    console.log(err);
  }
}

// merge styles

async function readFilesInDir() {
  try {
    const files = await readdir(INPUT_PATH_CSS, { withFileTypes: true });
    files.forEach((file) => {
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

//create html

async function createIndexHtml() {
  fs.readFile(TEMPLATE_PATH, (err, data) => {
    let template;
    if (err) console.log(err);
    template = data.toString();
    (
      async () => {
        const files = await readdir(COMPONENTS_PATH, { withFileTypes: true });
        files.forEach(file => {
          let fileName = file.name.split('.')[0];
          let componentRStream = fs.createReadStream(path.join(COMPONENTS_PATH, file.name));
          let componentData = '';
          componentRStream.on('data', chunk => componentData += chunk);
          componentRStream.on('end', () => {
            if (fileName) {
              template = template.replace(`{{${fileName}}}`, componentData);
            }
            let ws = fs.createWriteStream(OUTPUT_PATH_HTML);
            ws.write(template);
          });
        });
      }
    )();
  });
}