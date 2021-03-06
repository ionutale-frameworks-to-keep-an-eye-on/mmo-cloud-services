# MMO Cloud Service

Several microservices for the cloud of the mmo engine that simulates the game.

## Microservices Architecture

Backend communication is through ZeroMQ with horizontal scaling at each service layer.

![microservices](/images/microservices.png)


## Setup Instructions

### HowTo run Service on Windows 7, 64 bit System:

A) Install Phython: 2.7
B) install Tortoise Git: https://code.google.com/p/tortoisegit/wiki/Download (Version 1.7.10, choose installation with path)
C) Install Node.js: http://nodejs.org/download/
D) go to https://github.com/TooTallNate/node-gyp and see requirements for socket.io most likely the following: 
	1. Microsoft Visual Studio C++ 2010 
	2. For 64-bit builds of node and native modules you will also need the Windows 7 64-bit SDK. 
	3. Compiler update for the Windows SDK 7.1
    
   
E) clone git repository to local folderssl:
F) Goto  http://slproweb.com/products/Win32OpenSSL.html  and install Visual C++ 2008 Redistributables and  install Win64 OpenSSL v1.0.1f
G) install  visual studio 2010 professional and pack 1 update for visual studio 2010 
H) Install ZeroMQ
I) goto server folder in bash and type: "npm install" 

    Note: If there are still compile errors when installing bcrypt or zmq or bson (which require node-gyp) try specifying the visual studio version manually: 
    npm install zmq --msvs_version=2012
    npm install bcrypt --msvs_version=2012
    npm install bson --msvs_version=2012
 
J) install mongoDB

K) Install Webstorm: http://www.jetbrains.com/webstorm/ and license it
L) Configure Webstorm:
	2. create new project from existing files
	3. choose first option, local host, no synch
	4. web server root URL: localhost, check box
	5. leave empty
	6. In Program goto run--> edit configurations
		Create 3 new Configurations (InitDatabase,Server, and Client)
		For InitDatabase and Server create new node.js and select server working directory.
		For InitDatabase choose InitDB.js for Server choose server.js for java script files
		For client select new Java Script Debug select browser type and url = "http://localhost:8080"
		In client for for file directory "client" type in remote url "http://localhost:8080"
		In client for for file directory "game" type in remote url "http://localhost:8080/game"
	
	


### HowTo run Serenity on Linux 64 bit:

We assume you want to install under /work/username

1. Install node.js:

echo 'export PATH=/work/username/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir /work/username/local
mkdir -p /work/username/installers/node-latest-install
cd /work/username/installers/node-latest-install
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure --prefix=/work/username/local
make install # ok, fine, this step probably takes more than 30 seconds...

2. Install npm:

download https://www.npmjs.org/install.sh and save to folder /work/username/installers/node-latest-install
chmod +x install.sh
./install.sh

3: Install PostgreSQL:

cd /work/username/installers
git clone https://github.com/postgres/postgres.git
cd postgres
./configure --prefix=/work/username/local
make
make install
cd /work/username/local/bin
./initdb -D /work/username/local/data/posgresDb


4: Install mongodb:

download from https://www.mongodb.org/downloads
select "Linux 64 bit legacy"
extract the files and mv all files from the bin folder to /work/username/local/bin
mkdir -p /work/username/local/data/mongodb


5: Install libsodium:

download the latest version from https://download.libsodium.org/libsodium/releases/
For example download libsodium-1.0.3.tar.gz
and extract to /work/username/installers/libsodium-1.0.3
cd /work/username/installers/libsodium-1.0.3
./configure --prefix=/work/username/local
make
make install
mkdir -p /work/username/local/data/mongodb

6: Install zeromq:

download the latest POSIX tarball from http://zeromq.org/area:download
For example download zeromq-4.1.3.tar.gz
and extract to /work/username/installers/zeromq-4.1.3
cd /work/username/installers/zeromq-4.1.3
export PKG_CONFIG_PATH=/work/username/local/lib/pkgconfig
./configure --prefix=/work/username/local
make
make install

7: Run "npm install" in the src/server folder.

Always before running npm install make sure that you specify the envrionment variable:
export PKG_CONFIG_PATH=/work/username/local/lib/pkgconfig

For node v5 (maybe also v4) you need gcc 4.8 or newer. You may specify the path using:
export CC=/work/hofinger/local/gcc-4.8.0/bin/gcc
export CXX=/work/hofinger/local/gcc-4.8.0/bin/g++


8: Execute the following to initialize postgresql with a username 'postgres' with password 'popetest' and a database 'pope':

/work/username/local/bin/createuser --pwprompt postgres
Enter two times the following password: popetest
/work/username/local/bin/createdb --owner=postgres pope
/work/username/local/bin/psql -d pope --command='ALTER SCHEMA public OWNER TO postgres;'

9: To start PostgreSQL run:

/work/username/local/bin/pg_ctl -D /work/username/local/data/posgresDb -l logfile start

10: Running the server:

Before running the server start mongodb by executing: /work/username/local/bin/mongod --dbpath /work/username/local/data/mongodb --bind_ip 127.0.0.1. --port 27017
Before running the server specify the environment variable: LD_LIBRARY_PATH=/work/username/local/lib
For example in Webstorm there is the field Environment Variables in the Server Debug/Run Configuration. There you can also specify the path to the node.js executable as /work/username/local/bin/node


## Development:

Javascript modules should be written as described at:
http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/
