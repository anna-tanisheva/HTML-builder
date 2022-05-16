const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = process;
const output = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(output);

stdout.write('Please enter any text: ');
stdin.on('data', data => {
  const dataToString = data.toString();
  if (dataToString.indexOf('exit') !== -1) {
    exit();
  } else {
    writeStream.write(dataToString);
  }
});
process.on('exit', () => { stdout.write('It was pleasure, see you next time!'); });