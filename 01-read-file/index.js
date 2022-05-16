const fs = require('fs');
const path = require('path');
const source = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(source, 'utf-8');

let data = '';
readStream.on('data', chunk => data += chunk);
readStream.on('end', () => console.log(data));
readStream.on('error', err => console.log(err.message));

