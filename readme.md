Features
========
* Responsive UI with support for portrait/landscape phones as well as tablets
* File browser with the ability to add folders as Favorites
* Keeps track of files you've watched so you can pick up where you left off
* Choose which file types you care about
* Multi-monitor support - Move MPC from one screen to another

#### Screenshots
Controls tab
<br />
![alt text](http://i.imgur.com/HtgsgkJ.png "Controls tab - phone in portrait orientation")

Browse tab
<br />
![alt text](http://i.imgur.com/8LCp9Oy.png "File browser")

Tablet layout
<br />
![alt text](http://i.imgur.com/yxJ6ek0.png "Tablet layout")


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
