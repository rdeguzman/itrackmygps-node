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
- Change postgres settings in `server.js`
- Create the locaiton table:`psql -d gpslogger_production -U your_username -f docs/locations.sql`
- Change Google map key settings in `map.html`
- Start the gps_server: `node server.js`


