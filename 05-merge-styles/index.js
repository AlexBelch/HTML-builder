const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
const cssPath = path.join(__dirname, 'styles');

fs.writeFile(bundlePath, '', error => {
  if (error) throw error;
});

fs.readdir(cssPath, 'utf-8', (error, files) => {
  if (error) throw error;

  files.forEach(file => {
    if (path.parse(path.join(cssPath, file)).ext === '.css') {
      const stream = fs.createReadStream(path.join(cssPath, file));

      stream.on('data', data => {
        fs.appendFile(bundlePath, data, error => {
          if (error) throw error;
        });
      });
      stream.on('data', () => {
        fs.appendFile(bundlePath, '\r', error => {
          if (error) throw error;
        });
      });
    }
  });
});