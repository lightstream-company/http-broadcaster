var http = require('http');
var url = require('url');
var urljoin = require('url-join');

module.exports = function createServer(urls) {

  if (!urls || !(urls instanceof Array) || urls.length < 1) {
    throw new Error('http-broadcast require an array of urls');
  }

  var server = http.createServer((req, res) => {

    var ended = {};
    urls.forEach(u => ended[u] = false);

    var reqs = urls.map((u) => {
      const options = url.parse(urljoin(u, req.url));
      options.method = 'POST';
      const query = http.request(options);
      query.on('error', error => console.log(error));
      return query;
    });

    req.on('data', chunk => reqs.forEach(r => r.write(chunk)));
    req.on('end', () => reqs.forEach(r => {
      r.end();
      res.end();
    }));

  });

  return server;
};
