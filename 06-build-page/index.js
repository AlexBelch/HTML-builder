const path = require('path');
const { copyFile, mkdir, readdir, rm } = require('fs/promises');
const { createReadStream, createWriteStream, readFile } = require('fs');

async function createAssets(src, dest) {
  try {
    const entries = await readdir(src, { withFileTypes : true });

    await mkdir(dest);  

    for(let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if(entry.isDirectory()) {
        await createAssets(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function createCSS() {
  try {
    const src = path.join(__dirname, 'styles');
    const dist = path.join(__dirname, 'project-dist', 'style.css');

    const files = await readdir(src.toString(), {withFileTypes: true});

    for (const file of files) {
      if(file.isFile() && path.extname(file.name) == '.css') {
        let data = '';
        const stream = createReadStream(path.join(__dirname, 'styles', file.name));

        stream.on('data', chunk => data += chunk);
        stream.on('end', () => {
          const writeStream = createWriteStream(dist, { flags: 'a'});
          writeStream.write(data);
          writeStream.write('\r');
        }
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function createHTML() {
  try {
    await readFile(path.join(__dirname, 'template.html'), 'utf8', (error, data) => {
      if (error) throw error;

      let content = data.toString();
      const templateNames = getTemplates(content);
      const componentsPromices = [];

      templateNames.forEach((name) => {
        componentsPromices.push(
          new Promise((resolve, reject) => {
            readFile(path.join(__dirname, 'components', `${name}.html`),'utf-8', (err, innerData) => {
              if (err) {
                reject(err); 
              }
              else {
                resolve(innerData);
              }
            });
          })
        );
      });

      Promise.all(componentsPromices).then(values => {
        templateNames.forEach((name, index) => {
          content = content.replace(`{{${name}}}`, values[index]);
        });

        const writeStream = createWriteStream(path.join(__dirname, 'project-dist', 'index.html'), { flags: 'a'});
        writeStream.write(content);
        writeStream.write('\r');
      });
    });
  } catch (error) {
    console.error(error);
  }
}

function getTemplates(str) {
  const templateNames = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] == '{' && str[i + 1] == '{') {
      const lastPos = str.indexOf('}}', i);
      templateNames.push(str.slice(i + 2, lastPos));
    }
  }

  return templateNames;
}

async function run() {
  const assetsSrc = path.join(__dirname, 'assets');
  const assetsDest = path.join(__dirname, 'project-dist', 'assets');
  const projectDist = path.join(__dirname, 'project-dist');

  try {
    await mkdir(projectDist);
    createAssets(assetsSrc, assetsDest);
    createCSS();
    createHTML();
  } catch (err) {
    if (err.code === 'EEXIST') {
      await rm(projectDist, { recursive: true });
      run(); 
    }
  }
}

run();
