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
    var errored = false;

    urls.forEach((u) => {
      ended[u] = false;
    });

    function isFinish() {
      return Object.keys(ended).filter(v => ended[v]).length === urls.length;
    }

    function answer() {
      if (isFinish()) {
        if (errored) {
          res.writeHead(500); 
        }
        res.write(JSON.stringify(statuses));
        res.end();
      }
    }

    var reqs = urls.map((u) => {
      const options = url.parse(urljoin(u, req.url));
      options.method = 'POST';
      const query = http.request(options, (response) => {
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
          answer();
        });

      });

      query.on('error', error => {
        errored = true;
        statuses[u] = {
          status: 500,
          body: error
        };
        ended[u] = true;
        answer();
      });

      return query;
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
