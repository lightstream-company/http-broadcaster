# http-broadcaster
HTTP server forward query over multiple services. Return merged statuses code as a JSON


## Docker

```
docker run -it --name broadcaster tweetping/http-broadcaster -u http://localhost:3000/ -u http://service2/
```

if other services run in container, do not forget to link it
```
docker run -it --name broadcaster \
  -p 8080:8080 \
  --link service2 \
  tweetping/http-broadcaster -u http://localhost:3000/ -u http://service2/
```
