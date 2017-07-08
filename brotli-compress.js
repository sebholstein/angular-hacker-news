var brotli = require('brotli');
var fs = require('fs');

const files = [
  'index.html',
  'app.min.js',
  'assets/manifest.json',
  'assets/angular.svg'
];

const distDir = __dirname + '/dist/src/';

files.forEach((f) => {
  var compressed = brotli.compress(fs.readFileSync(distDir + f));
  const brFilename = distDir + '/' + f + '.br';
  console.log('generating brotli file', brFilename);
  fs.writeFileSync(brFilename, compressed, 'utf-8');
})