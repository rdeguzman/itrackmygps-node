gpslogger-node
==============
Node backend for Android GPS Logger <http://github.com/rdeguzman/gpslogger-android>

# Instructions

You will need:

- Node.js
- Socket.io
- Postgres
- Webserver

## Installation

- Clone the project from `git clone https://github.com/rdeguzman/gpslogger-node.git`
- Install `pg` from npm: `npm install pg`
- Install `socket.io` from npm: `npm install socket.io`
- Create the locations table:`psql -d gpslogger_production -U your_username -f docs/locations.sql`
- Set environment variables for postgres settings:
 
 	```
 	export PGUSER=rupert
 	export PGPASS=password
 	```
 
- Change Google Map Key settings and socket_host in `map.html`
- Start the gps_server: `node server.js`


