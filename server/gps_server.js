var http = require('http'),
    qs = require('querystring'),
    pg = require('pg');

var connectionString = "postgres://rupert@localhost/gpslogger_development";

function handle_incoming_request(req, res){
  console.log("Incoming request: (" + req.method + ") " + req.url);

  var form_data = "";

  req.on(
      "readable",
      function () {
        var d = req.read();
        if(typeof d == 'string')
            form_data += d;
        else if(typeof d == 'object' && d instanceof Buffer)
          form_data += d.toString("utf8");

      }
  );

  req.on(
      "end",
      function () {
        var response = {};

        if(!form_data){
          response['valid'] = false;
          response['message'] = 'No Data';
        }
        else {
          var obj = qs.parse(form_data);
          if (!obj){
            response['valid'] = false;
            response['message'] = 'Cannot parse data';
          }
          else {
            insertLocation(obj);
            console.log('form data: ' + JSON.stringify(obj));

            response['valid'] = true;
            response['message'] = 'OK';
          }
        }

        var response_out = JSON.stringify(response);
        res.end(response_out);
      }
  );
}

function insertLocation(loc){
  pg.connect(connectionString, function(err, client, done) {
    if(err) {
      console.error('error fetching client from pool ', err);
    }
    else{
      var sqlStmt  = "INSERT INTO locations(gps_timestamp,";
          sqlStmt += "gps_latitude,";
          sqlStmt += "gps_longitude,";
          sqlStmt += "gps_speed,";
          sqlStmt += "gps_heading,";
          sqlStmt += "created_at,";
          sqlStmt += "updated_at)";
          sqlStmt += "VALUES ($1, $2, $3, $4, $5, Now(), Now())";

      var sqlParams = [loc.gps_timestamp, loc.gps_latitude, loc.gps_longitude, loc.gps_speed, loc.gps_heading];

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


var s = http.createServer(handle_incoming_request);
s.listen(8080);
