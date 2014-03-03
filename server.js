var http = require('http');
var url = require('url');
var qs = require('querystring');
var io = require('socket.io');
var fs = require('fs');

var pg = require('pg');
var port = 8080;

var map_clients = [];

var PGUSER = process.env.PGUSER;
var PGPASS = process.env.PGPASS;
var PGDATABASE = process.env.PGDATABASE;
var connectionString = "postgres://" + PGUSER + ":" + PGPASS + "@localhost/" + PGDATABASE;
//console.log('connectionString:' + connectionString);

var route = {
  routes : {},
  for: function(method, path, handler){
    this.routes[method + path] = handler;
  }
}

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
      console.log("client.user_id:" + client.user_id);
      console.log("client.devices:" + client.devices);

      if (typeof client.devices != "undefined") {
        if(isAllowed(client.devices, obj.uuid)){
          console.log("Sending gps to viewer: " + client.user_id);
          console.log("Devices: " + client.devices);

          var jsonString = JSON.stringify({ type:'gps', data:obj});
          client.send(jsonString);
        }
      }

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
          sqlStmt += "uuid,";
          sqlStmt += "gps_timestamp,";
          sqlStmt += "gps_latitude,";
          sqlStmt += "gps_longitude,";
          sqlStmt += "gps_speed,";
          sqlStmt += "gps_heading,";
          sqlStmt += "created_at)";
          sqlStmt += "VALUES ($1, $2, $3, $4, $5, $6, Now())";

      var sqlParams = [loc.uuid, loc.gps_timestamp, loc.gps_latitude, loc.gps_longitude, loc.gps_speed, loc.gps_heading];

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

function isAllowed(devices_array, uuid){
  return devices_array.indexOf(uuid) > -1;
}

var server = http.createServer(onRequest);
server.listen(port);
console.log("Server " + port + " has started.");

io = io.listen(server);

io.sockets.on("connection", function(client){
  // We push the map clients to an array.
  // If a gps is received from a device,
  // we broadcast the gps to all map clients.
  map_clients.push(client);

  client.on('setUserId',function(user_id){
    console.log("Map client connected for user_id: " + user_id);
    client.user_id = user_id;
  });

  client.on('addDevice',function(device_id){
    console.log("Add device_id: ");

    if (typeof client.devices == "undefined") {
      client.devices = [];
    }

    client.devices.push(device_id);
  });


  client.on('disconnect', function(){
    map_clients.splice(map_clients.indexOf(client), 1);
  })

});


