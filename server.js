var http = require('http');
var url = require('url');
var qs = require('querystring');
var io = require('socket.io');
var fs = require('fs');

var pg = require('pg');
var port = 8080;

var map_clients = [];

var connectionString = "postgres://rupert@localhost/gpslogger_development";

var route = {
  routes : {},
  for: function(method, path, handler){
    this.routes[method + path] = handler;
  }
}

route.for("GET", "/map", function(request, response){
  fs.readFile('./map.html', function(error, data){
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(data, 'utf-8');
  })
});

route.for("POST", "/location", function(request, response){
  var form_data = "";
  request.on('data', function(chunk){
    form_data += chunk.toString();
  })

  request.on('end', function(){
    console.log(form_data);

    var obj = qs.parse(form_data);
    insertLocation(obj);
    console.log("Connected clients: " + map_clients.length);

    for(var i=0; i < map_clients.length; i++){
      var client = map_clients[i];
      var jsonString = JSON.stringify({ type:'gps', data:obj});
      client.send(jsonString);
    }

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("OK");
    response.end();
  })
});

function onRequest(request, response){
  var pathname = url.parse(request.url).pathname;
  console.log(request.method + " request for " + pathname);

  if(typeof(route.routes[request.method + pathname]) === 'function'){
    route.routes[request.method + pathname](request, response);
  }
  else{
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.end("404 not found");
  }
}

function insertLocation(loc){
  pg.connect(connectionString, function(err, client, done) {
    if(err) {
      console.error('error fetching client from pool ', err);
    }
    else{
      var sqlStmt  = "INSERT INTO locations(";
          sqlStmt += "device_id,";
          sqlStmt += "gps_timestamp,";
          sqlStmt += "gps_latitude,";
          sqlStmt += "gps_longitude,";
          sqlStmt += "gps_speed,";
          sqlStmt += "gps_heading,";
          sqlStmt += "created_at)";
          sqlStmt += "VALUES ($1, $2, $3, $4, $5, $6, Now())";

      var sqlParams = [loc.device_id, loc.gps_timestamp, loc.gps_latitude, loc.gps_longitude, loc.gps_speed, loc.gps_heading];

      var query = client.query(sqlStmt, sqlParams, function(err, result){
        if(err){
          console.error('error inserting ', err);
        }
        else{
          console.log(result);
        }

      });

      done();
    }
  });
}

var server = http.createServer(onRequest);
server.listen(port);
console.log("Server " + port + " has started.");

io = io.listen(server);

io.sockets.on("connection", function(client){

  // We push the map clients to an array.
  // If a gps is received from a device,
  // we broadcast the gps to all map clients.
  console.log("Map client connected");
  map_clients.push(client);

  client.on('disconnect', function(){
    map_clients.splice(map_clients.indexOf(client), 1);
  })

});


