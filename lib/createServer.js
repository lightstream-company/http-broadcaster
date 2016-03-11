var http = require('http');
var url = require('url');
var urljoin = require('url-join');

module.exports = function createServer(urls) {

  if (!urls || !(urls instanceof Array) || urls.length < 1) {
    throw new Error('http-broadcast require an array of urls');
  }

  var server = http.createServer((req, res) => {


    var statuses = {};
    var ended = {};
    urls.forEach((u) => {
      ended[u] = false;
    });

    var reqs = urls.map((u) => {
      return http.request(url.parse(urljoin(u, req.url)), (response) => {
        statuses[u] = {
          status: response.statusCode
        };
        var body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          statuses[u].body = body;
          ended[u] = true;
          if(Object.keys(ended).filter(v => ended[v]).length === urls.length){
            res.write(JSON.stringify(statuses));
            res.end();
          }
        });

      });
    });

    req.on('data', (chunk) => {
      reqs.forEach((r) => {
        r.write(chunk);
      });
    });
    req.on('end', () => {
      reqs.forEach((r) => {
        r.end();
      });
    });
  });

  return server;
};
