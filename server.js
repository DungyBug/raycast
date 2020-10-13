const http = require("http");
const fs = require("fs");

http.createServer((req, res) => {
    if(req.url.match(".js")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
    }
    if(req.url.match(".html")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
    }
    if(req.url.match(".jpg")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/jpeg"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
    }
    if(req.url.match(".png")) {
        fs.readFile('.' + req.url, (err, data) => {
            if(data) {
                res.writeHead(200, {"Content-Type": "image/png"});
                res.end(data);
            } else {
                console.error(err);
            }
        });
    }
}).listen(80);