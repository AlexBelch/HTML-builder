const fs = require('fs');
const path = require('path');

const getInfoFile = (file) => {
  if (file.isFile()) {
    fs.stat(
      path.resolve(__dirname, 'secret-folder', file.name),
      (error, stats) => {
        if (error) {
          return console.log(error);
        }

        console.log(`${file.name.split('.').slice(0, -1).join('.')} - ${path.extname(file.name).slice(1)} - ${stats.size / 1024 + 'Kb'}`);
      }
    );
  }
};

fs.readdir(
  path.join(__dirname, 'secret-folder'),
  { withFileTypes: true },
  (error, files) => {
    if (error) {
      return console.log(error);
    }

    files.forEach((item) => {
      getInfoFile(item);
    });
  }
);
