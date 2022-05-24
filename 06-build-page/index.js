const fs = require('fs');
const path = require('path');

const pathStyles = path.join(__dirname, 'styles');
const pathCopy = path.join(__dirname, 'project-dist');
const pathAssetsCopy = path.join(pathCopy, 'assets');
const folderPath = path.join(__dirname, 'components');
const pathAssets = path.join(__dirname, 'assets');
const pathTemplate = path.join(__dirname, 'template.html');
const pathIndex = path.join(pathCopy, 'index.html');

//create styles css file dist
fs.readdir(pathStyles, {withFileTypes: true}, async (error, files) => {
  if (error) {
    console.log(error);
    throw error;
  }

  files.forEach((file, index) => {
    const filePath = path.join(pathStyles, file.name);

    if (file.isFile() && path.extname(file.name) == '.css') {
      fs.readFile(filePath, 'utf8', (error, data) => {
        if(error) {
          console.log(error);
          throw error;
        }

        if (index === 0) {
          fs.writeFile(path.join(pathCopy, 'style.css'), data, error => {
            if(error) {
              console.log(error);
            }
          });
        } else {
          fs.appendFile(path.join(pathCopy, 'style.css'), data, error => {
            if(error) {
              console.log(error);
            }
          });
        }

        fs.appendFile(path.join(pathCopy, 'style.css'), '\r', error => {
          if(error) {
            console.log(error);
          }
        });
      });
    }
  });
});

//func for create index.html
const createTemplate = () => {
  fs.copyFile(pathTemplate, pathIndex, error => {
    if (error) {
      console.log(error);
      throw error;
    }
    
    fs.readFile(pathIndex, 'utf8', (error2, data) => {
      if (error2) {
        console.log(error2);
        throw error2;
      }

      fs.readdir(folderPath, {withFileTypes: true}, (error3, files) => {
        if (error3) {
          console.log(error3);
          throw error3;
        }
  
        files.forEach(file => {
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
        });

      });
  
    });
  });
};

//create index.html
fs.stat(pathCopy, error => {
  if (error) {
    fs.mkdir(pathCopy, error2 => {
      if (error2) {
        return console.log(error2);
      }
    });
  } else {  
    fs.readdir(pathCopy, error3 => {
      if (error3) {
        return console.log(error3);
      }
    });
  }

  createTemplate();
});

//func for recursive copy files 
const deepCopy = (dir, end) => {
  fs.readdir(dir, {withFileTypes: true}, (error, files) => {
    if(error) {
      console.log(error);
      throw error;
    }

    files.forEach(file => {
      if (!file.isFile()) {
        fs.stat(path.join(end, file.name), error => {
          if (error) {
            fs.mkdir(path.join(end, file.name), error2 => {
              if (error2) {
                return console.log(error2);
              }
            });
  
            deepCopy(path.join(dir, file.name), path.join(end, file.name));
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
    });
  });
};
  
// copy dir assets
fs.stat(pathAssetsCopy, error => {
  if (error) {
    fs.mkdir(pathAssetsCopy, error2 => {
      if (error2) {
        console.log(error2);
      }
      deepCopy(pathAssets, pathAssetsCopy);
    });
  } else {
    deepCopy(pathAssets, pathAssetsCopy);
  }
});
  