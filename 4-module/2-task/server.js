const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      writeStream.on('error', (error) => {
        if (error.code == 'ENOENT' || pathname.indexOf('/') > 0) {
          res.writeHead(400);
          res.end('Bad request');
        }
        if (error.code == 'EEXIST') {
          res.writeHead(409);
          res.end('File already exist');
        }
      });

      writeStream.on('close', () => {
        res.writeHead(201);
        res.end('Success');
      });

      req.connection.on('close', (err) => {
        if (err) {
          fs.unlinkSync(filepath);
        }
      });

      const limitedStream = new LimitSizeStream({limit: 1*1024*1024});

      limitedStream.on('error', (err) => {
        if (err.code == 'LIMIT_EXCEEDED') {
          fs.unlinkSync(filepath);
          res.statusCode = 413;
          res.end('Too big file');
        }
      });

      req.pipe(limitedStream);
      limitedStream.pipe(writeStream);
      req.pipe(writeStream);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;