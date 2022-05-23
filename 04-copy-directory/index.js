

const fs = require('fs/promises');
const path = require('path');

const dir = path.join(__dirname, 'files');
const dircopy = path.join(__dirname, 'files-copy');

fs.rm(dircopy, {
  recursive: true,
  force: true
}).finally(() => {
  fs.mkdir(dircopy, {
    recursive: true
  });

  fs.readdir(dir, {
    withFileTypes: true
  }).then(data => {
    data.forEach(item => {
      if (item.isFile()) {
        const pathItem = path.join(dir, item.name);
        const pathItemCopy = path.join(dircopy, item.name);
        fs.copyFile(pathItem, pathItemCopy);
      }
    });
  });
});