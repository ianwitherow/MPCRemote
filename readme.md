Installation
============

###### Note: this project currently requires Node.js to be installed

1. Clone the repo
2. Enable the Web Interface in Media Player Classic. View > Options > Web Interface
3. Edit server\settings.json
	* webServerPort: This is the port that the web server will listen on
	* mpcRemoteServerPort: This is the port the Node server will listen on. This is the server that the page talks to
	* mpcUrl: Where Media Player Classic is running. The default port is 13579
	* mpcPath: File path of the MPC exe
	* webRoot: Where these files live
4. Launch server\Run Server.bat (or run node server.js)
5. Open up the site in a browser and go to the Config tab. Enter in the IP/port that the Node server is running on (mpcRemoteServerPort).
