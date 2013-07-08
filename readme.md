Installation
============

###### Note: this project currently requires [Node.js](http://nodejs.org) to be installed

1. Clone the repo
2. Enable the Web Interface in Media Player Classic. View > Options > Web Interface
3. Edit server\settings.json
	* `serverPort`: This is the port that the server will listen on; point your browser here
	* `mpcPath`: File path of the MPC exe. Set to "auto" to autodetect the location
	* `mpcUrl`: Where Media Player Classic's Web Interface is listening. Set to "default" to use the default port (13579) on localhost
4. Launch "server\Run Server.bat" (or run `node server.js`)
5. Browse to your IP/hostname, using the same port you set for `serverPort`
