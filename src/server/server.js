var child_process = require('child_process');
var AsyncSocket = require('./asyncReplySocket').AsyncRouter;
var debugPortIterator = 5873;

require('console-stamp')(console, {
    pattern: 'HH:MM:ss.l',
    metadata: '[server]'
});

function getDebugArgs() {
    debugPortIterator++;
    if (typeof v8debug === 'object') {
        return {
            //execArgv: ['--debug']
            execArgv: ['--debug-brk=' + debugPortIterator]
        };
    }
    else {
        return {};
    }
}

var currentlyStartingMapIds = {};
var allChild_processes = [];

function startProxyRouter(_id) {
    var forker = child_process.fork(
        __dirname + '/serverProxyRouter.js',
        [_id],
        getDebugArgs()
    )
    allChild_processes.push(forker);
}

function startPubSubForwarder(_id) {
    var forker = child_process.fork(
        __dirname + '/serverPubsubForwarder.js',
        [_id],
        getDebugArgs()
    )
    allChild_processes.push(forker);
}


function startLayerServerById(mapId, cb) {
    var forker = child_process.fork(
        __dirname + '/serverLayer.js',
        [mapId],
        getDebugArgs()
    )

    forker.on('message', function(m) {
        if (cb) cb(m);

    });
    allChild_processes.push(forker);
}

function startSocketioProxy(_id) {
    var forker = child_process.fork(
        __dirname + '/serverSocketio.js',
        [_id],
        getDebugArgs()
    )
    allChild_processes.push(forker);
}



var _id = "master";
var targetProxy = 'proxy1';
console.log('started server: ' + _id);
var asyncSocket = new AsyncSocket('router');
asyncSocket.identity = _id;
var registeredAtProxy = false;
function registerToProxy() {
    asyncSocket.sendReq(
        targetProxy,
        'register',
        _id,
        function(success, err) {
            if (success) {
                registeredAtProxy = true;
                console.log(_id + ': registered at proxy!');
            }
            else {
                console.log(err);
                console.log(_id + ': registration at proxy failed!');

                //retry:
                registerToProxy();
            }
        },
        300 //timeout 300 ms
    );
}
asyncSocket.monitor();
asyncSocket.on("connect",function(event_value, event_endpoint_addr){
    // register this client to proxy:
    registerToProxy();
});
asyncSocket.connect('tcp://127.0.0.1:5001');


asyncSocket.on('startLayerServer',function(msgData, callback) {

    console.log("master: starting layer server "+msgData.mapId+"...");

    if (currentlyStartingMapIds[msgData.mapId]) {
        var startingDate = currentlyStartingMapIds[msgData.mapId].date;
        var timeDiff = Date.now()-startingDate;

        if (currentlyStartingMapIds[msgData.mapId].started) {
            console.log("master: server "+msgData.mapId+" is now started...")
            callback({
                success: true
            });
        }
        else {
            console.log("master: server "+msgData.mapId+" is already starting up...")
            currentlyStartingMapIds[msgData.mapId].callbacks.push(
                function() {
                    callback({
                        success: true
                    });
                }
            );
        }

    }
    else {
        console.log("master: start layer server "+msgData.mapId+"...");
        currentlyStartingMapIds[msgData.mapId] = {
            date: Date.now(),
            started: false,
            callbacks: [
                function() {
                    callback({
                        success: true
                    });
                }
            ]
        };
        startLayerServerById(msgData.mapId, function(m) {
            console.log("master: layer "+msgData.mapId+" started and registered at proxy...");
            var cbs = currentlyStartingMapIds[msgData.mapId].callbacks;
            for (var i= 0, len=cbs.length; i<len; i++) {
                cbs[i]();
            }
        });
    }


});




setTimeout(function() {startProxyRouter("1")},200);
setTimeout(function() {startPubSubForwarder("1")},400);
setTimeout(function() {startSocketioProxy("1")},600);

//startLayerServerById("galaxyMap01");
//startLayerServerById("solarMap01");
//setTimeout(startLayerServerById("moonMap01"),1000);
//startLayerServerById("moonMap01");
//setTimeout(startLayerServerById("cityMap01"),1000);
setTimeout(function() {startLayerServerById("galaxyMap01")},1000);


process.on("exit", function() {
    for (var i = 0; i< allChild_processes.lenght; i++) {
        console.log("kill child process "+i);
        allChild_processes[i].kill();
    }
});