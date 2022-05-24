const fs = require('fs');
const path = require('path');
const { mkdir, rm } = require('fs/promises');

const pathStyles = path.join(__dirname, 'styles');
const pathCopy = path.join(__dirname, 'project-dist');
const pathAssetsCopy = path.join(pathCopy, 'assets');
const folderPath = path.join(__dirname, 'components');
const pathAssets = path.join(__dirname, 'assets');
const pathTemplate = path.join(__dirname, 'template.html');
const pathIndex = path.join(pathCopy, 'index.html');

//func for create index.html
const createTemplate = async() => {
  await fs.copyFile(pathTemplate, pathIndex, async(error) => {
    if (error) {
      console.log(error);
      throw error;
    }
    
    await fs.readFile(pathIndex, 'utf8', async(error2, data) => {
      if (error2) {
        console.log(error2);
        throw error2;
      }

      await fs.readdir(folderPath, {withFileTypes: true}, (error3, files) => {
        if (error3) {
          console.log(error3);
          throw error3;
        }
  
        for (const file of files) {
          fs.readFile(path.join(folderPath, file.name), 'utf8', (error4, dataFile) => {
            if (error4) {
              console.log(error4);
              throw error4;
            }

            const tagName = `{{${file.name.split('.')[0]}}}`;
            data = data.replace(tagName, dataFile);

            fs.writeFile(pathIndex, data, error5 => {
              if (error5) {
                console.log(error5);
              }
            });
          });
        }
      });
  
    });
  });
};

//func for recursive copy files 
const deepCopy = async(dir, end) => {
  await fs.readdir(dir, {withFileTypes: true}, (error, files) => {
    if(error) {
      console.log(error);
      throw error;
    }

    for (const file of files) {
      if (!file.isFile()) {
        fs.stat(path.join(end, file.name), (error) => {
          if (error) {
            fs.mkdir(path.join(end, file.name), (error2) => {
              if (error2) {
                return console.log(error2);
              }
              deepCopy(path.join(dir, file.name), path.join(end, file.name));
            });
          } else {
            deepCopy(path.join(dir, file.name), path.join(end, file.name));
          }
        });
      } else {
        fs.copyFile(path.join(dir, file.name), path.join(end, file.name), error => {
          if (error) {
            console.log(error);
            throw error;
          }
        });
      }
    }
  });
};

const run = async () => {
  if (!fs.existsSync(pathCopy)) {
    await mkdir(pathCopy);
  } else {
    await rm(pathCopy, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      }
    });
    await mkdir(pathCopy);
  }

  // create styles css file dist
  await fs.readdir(pathStyles, {withFileTypes: true}, async (error, files) => {
    if (error) {
      console.log(error);
      throw error;
    }

    for (const file of files) {
      const filePath = path.join(pathStyles, file.name);

      if (file.isFile() && path.extname(file.name) == '.css') {
        fs.readFile(filePath, 'utf8', (error, data) => {
          if(error) {
            console.log(error);
            throw error;
          }

          const writeStream = fs.createWriteStream(path.join(pathCopy, 'style.css'), { flags: 'a'});
          writeStream.write(data);
          writeStream.write('\r');
        });
      }
    }
  });

  // create index.html
  await fs.stat(pathCopy, async(error) => {
    if (error) {
      await fs.mkdir(pathCopy, async(error2) => {
        if (error2) {
          return console.log(error2);
        }
        await createTemplate();
      });
    } else {
      await fs.readdir(pathCopy, async(error3) => {
        if (error3) {
          return console.log(error3);
        }
        await createTemplate();
      });
    }
  });

  // copy dir assets
  await fs.stat(pathAssetsCopy, async(error) => {
    if (error) {
      await fs.mkdir(pathAssetsCopy, async(error2) => {
        if (error2) {
          console.log(error2);
        }
      });
      await deepCopy(pathAssets, pathAssetsCopy);
    } else {
      await deepCopy(pathAssets, pathAssetsCopy);
    }
  });
};

run();
