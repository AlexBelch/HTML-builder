
const fs = require('fs');
const path = require('path');

const { stdout, stdin, exit } = require('process');
stdout.write('Hi! Type your text:) :\n');

const writeStream = fs.createWriteStream(path.join(__dirname, 'text.txt'), { flags: 'a'});

stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    end();
  }
  writeStream.write(data);
});

const end = () => {
  stdout.write('Bye!\n');
  exit();
};

process.on('SIGINT', end);
