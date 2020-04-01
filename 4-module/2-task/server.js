const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);
  const nestedPath = (pathname.includes('/') || pathname.includes('..'));
  const LIMIT_IN_ONE_MEGABYTE = 1024 * 1024;

  if (nestedPath) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed.');
    return;
  }

  switch (req.method) {
    case 'POST':
      fs.exists(filepath, (exists) => {
        if (exists) {
          res.statusCode = 409;
          res.end('File already exists');
          return;
        }

      });

      const writeStream = fs.createWriteStream(filepath, { flags: 'wx' });
      const limitStream = new LimitSizeStream({ limit: LIMIT_IN_ONE_MEGABYTE });

      req.on('aborted', () => {
        writeStream.end();
        writeStream.destroy();
        fs.unlinkSync(filepath);
      });

      req.on('close', () => {
        writeStream.destroy();
      });

      req.pipe(limitStream).pipe(writeStream);

      limitStream.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File is too big');
        }
      });

      writeStream.on('error', (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File already exists');
        }
      });

      writeStream.on('finish', () => {
        res.statusCode = 201;
        res.end('The file was saved successfully');
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
