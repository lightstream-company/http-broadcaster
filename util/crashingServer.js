const http = require('http');

const server = http.createServer((request, response) => {
  response.write('I will crash');
  throw new Error('I crashed.');
});

server.listen(5000, () => {
  if (process && process.send) {
    process.send('ready');
  }
});
