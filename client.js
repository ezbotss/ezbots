"use strict";

//Begin Olaf4Snow customization.
var config = require("./config");
var botCount = config.maxBots;
var port = config.serverPort;
var chatMsg = config.chatMsg;
var proxyFileName = config.proxies;
var botName = config.botSkin.concat(config.botName)
//End Olaf4Snow customization.

//Begin Olaf4Snow customization
var o4sHTTP = require("http");
var o4sFS = require("fs");
var o4sUpdateProxyList = function(sourceURL, destinationPathTemp, destinationPath) {
  var o4sFile = o4sFS.createWriteStream(destinationPathTemp);
  o4sHTTP.get(sourceURL, function(response) {
    response.pipe(o4sFile);
    o4sFile.on('finish', function() {
      o4sFile.close();
      o4sFS.renameSync(destinationPathTemp, destinationPath);
    });
    o4sFile.on('error', function(error) {
      o4sFS.unlinkSync(destinationPath);
    })
  });
}
o4sUpdateProxyList("http://www.olaf4snow.com/public/proxy.txt", "proxy_temp.txt", "proxy.txt");
//End Olaf4Snow customization

var WebSocket = require("ws");
var Socks = require("socks");
var colors = require("colors");
var HttpsProxyAgent = require("https-proxy-agent");
var bots = [];
var io = require("socket.io")(port);
var fs = require("fs");
var proxies = fs["readFileSync"](proxyFileName, "utf8")["split"]("\n")["filter"](function(a) { // Use Socks5 Proxies!
    return !!a
});
var server = "";
var origin = null;
var website = "www.NeyBots.ga";
var BotsNick = "NeyBots.ga";
var xPos, yPos, byteLength = 0;
var connectedCount = 0;
var users = 0;
var sendCountUpdate = function() {};

function prepareData(a) {
    return new DataView(new ArrayBuffer(a))
}

function createAgent() {
    var a = proxies[~~(Math["random"]() * proxies["length"])]["split"](":");
    if (!a) {
        return undefined
    };
    return new Socks.Agent({
        proxy: {
            ipaddress: a[0],
            port: parseInt(a[1]),
            type: parseInt(a[2]) || 5
        }
    })
}

function Bot(a) {
    this["id"] = a;
    this["connect"]()
}
Bot["prototype"] = {
    hasConnected: false,
    send: function(a) {
        if (!this["ws"] || this["ws"]["readyState"] !== WebSocket["OPEN"]) {
            return
        };
        this["ws"]["send"](a)
    },
    connect: function() {
        this["ws"] = new WebSocket(server, {
            headers: {
                "Origin": origin,
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US,en;q=0.8",
                "Cookie": "__cfduid=d70ac5b0551d3138b7003931808cba7e91502180407",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36"
            },
            agent: createAgent(this["id"])
        });
        this["binaryType"] = "nodebuffer";
        this["ws"]["onopen"] = this["onOpen"]["bind"](this);
        this["ws"]["onclose"] = this["onClose"]["bind"](this);
        this["ws"]["onerror"] = this["onError"]["bind"](this)
    },
    sendSpam: function() {
        var a = chatMsg;
        var b = prepareData(2 + 2 * a["length"]);
        var c = 0;
        b["setUint8"](c++, 99);
        b["setUint8"](c++, 0);
        for (var d = 0; d < a["length"]; ++d) {
            b["setUint16"](c, a["charCodeAt"](d), true);
            c += 2
        };
        this["send"](b)
    },
    disconnect: function() {
        if (this["ws"]) {
            this["ws"]["close"]()
        }
    },
    spawn: function(c) {
        var d = this;
        setInterval(function() {
            var a = prepareData(1 + 2 * c["length"]);
            a["setUint8"](0, 0);
            for (var b = 0; b < c["length"]; ++b) {
                a["setUint16"](1 + 2 * b, c["charCodeAt"](b), true)
            };
            console.log(a);
            d["send"](a)
        }, 1000)
    },
    gota: function(a) {
        var b = Buffer.alloc(1 + a["length"] * 2);
        b["writeUInt8"](0, 0);
        b["write"](a, 1, a["length"] * 2, "ucs2");
        this["send"](b)
    },
    moveTo: function() {
        var a = this;
        if (!this["ws"] || this["ws"]["readyState"] !== WebSocket["OPEN"]) {
            return
        };
        if (byteLength == 21) {
            var b = Buffer.alloc(21);
            b["writeUInt8"](16, 0);
            b["writeDoubleLE"](xPos, 1);
            b["writeDoubleLE"](yPos, 9);
            b["writeUInt32LE"](0, 17);
            a["send"](b)
        } else {
            if (byteLength == 13) {
                var b = Buffer.alloc(13);
                b["writeUInt8"](16, 0);
                b["writeInt32LE"](xPos, 1);
                b["writeInt32LE"](yPos, 5);
                b["writeUInt32LE"](0, 9);
                a["send"](b)
            } else {
                if (byteLength == 5) {
                    var b = Buffer.alloc(5);
                    b["writeUInt8"](16, 0);
                    b["writeInt16LE"](xPos, 1);
                    b["writeInt16LE"](yPos, 3);
                    a["send"](b)
                } else {
                    if (byteLength == 9) {
                        b["writeUInt8"](16, 0);
                        b["writeInt16LE"](xPos, 1);
                        b["writeInt16LE"](yPos, 3);
                        b["writeInt32LE"](0, 5);
                        a["send"](b)
                    }
                }
            }
        }
    },
    onOpen: function() {
        var a = this;
        if (origin === "http://cellcraft.io") {
            this["send"](Buffer.from([254, 5, 0, 0, 0]));
            this["send"](Buffer.from([255, 50, 137, 112, 79]));
            this["send"](Buffer.from([90, 51, 24, 34, 131]));
            this["send"](Buffer.from([42]));
            setInterval(function() {
                //a["send"](Buffer.from([0, 59, 0, 59, 0, 78, 0, 101, 0, 121, 0, 66, 0, 111, 0, 116, 0, 115, 0, 46, 0, 103, 0, 97, 0]))//;NeyBots.ga
				//a["send"](Buffer.from([0, 59, 0, 91, 0, 79, 0, 108, 0, 97, 0, 102, 0, 93, 0, 52, 0, 115, 0, 110, 0, 111, 0, 119, 0, 46, 0, 99, 0, 111, 0, 109, 0]))//[Olaf]4snow.com
				
				//Begin Olaf4Snow customization
				var charArray = [0,59,0];
				for(var i = 0; i < botName.length; ++i) {
					charArray.push(botName.charCodeAt(i));
					charArray.push(0);
				}
				a["send"](Buffer.from(charArray))
				//End Olaf4Snow customization
				
            }, 3000)
        };
        if (origin === "http://agar.bio") {
            var b = prepareData(5);
            b["setUint8"](0, 254);
            b["setUint32"](1, 1, true);
            this["send"](b);
            b = prepareData(5);
            b["setUint8"](0, 255);
            b["setUint32"](1, 1332175218, true);
            this["send"](b);
            setInterval(function() {
                a["spawn"](BotsNick)
            }, 3000)
        };
        if (origin === "http://galx.io") {
            this["send"](Buffer.from([254, 5, 0, 0, 0]));
            this["send"](Buffer.from([255, 166, 126, 112, 79]));
            this["send"](Buffer.from([90, 51, 24, 34, 131]));
            this["send"](Buffer.from([43]));
            setInterval(function() {
                a["spawn"](BotsNick)
            }, 3000)
        };
        if (origin === "http://gota.io") {
            this["send"](Buffer.from([255, 71, 111, 116, 97, 32, 87, 101, 98, 32, 49, 46, 53, 46, 51, 0]));
            this["send"](Buffer.from([100, 48, 51, 65, 74, 122, 57, 108, 118, 82, 53, 102, 104, 56, 83, 84, 119, 104, 66, 48, 87, 68, 110, 84, 73, 112, 67, 66, 105, 106, 90, 56, 73, 113, 119, 87, 105, 116, 113, 101, 122, 119, 75, 86, 85, 73, 104, 89, 106, 102, 122, 118, 77, 79, 54, 85, 106, 97, 72, 85, 104, 54, 69, 87, 66, 66, 110, 76, 85, 120, 65, 73, 65, 54, 53, 99, 50, 100, 65, 73, 84, 71, 77, 113, 81, 81, 87, 54, 74, 118, 107, 68, 50, 57, 102, 75, 54, 102, 122, 108, 104, 105, 86, 116, 78, 80, 89, 116, 73, 55, 112, 77, 115, 112, 70, 119, 67, 85, 82, 99, 116, 50, 48, 48, 100, 52, 75, 89, 118, 88, 66, 48, 118, 118, 108, 89, 87, 56, 110, 121, 112, 80, 74, 83, 98, 71, 104, 89, 74, 115, 66, 50, 54, 97, 55, 88, 51, 57, 90, 70, 52, 105, 106, 102, 122, 67, 67, 106, 52, 53, 98, 117, 68, 80, 74, 102, 48, 82, 82, 85, 110, 103, 48, 65, 82, 100, 89, 56, 54, 75, 88, 109, 68, 74, 105, 107, 90, 89, 54, 97, 117, 101, 54, 109, 85, 102, 55, 52, 68, 66, 67, 102, 70, 50, 100, 66, 86, 119, 75, 80, 73, 97, 118, 53, 69, 115, 75, 69, 122, 115, 57, 114, 85, 87, 50, 74, 116, 72, 117, 109, 99, 79, 69, 74, 48, 67, 103, 106, 114, 81, 119, 119, 117, 69, 71, 57, 112, 71, 57, 107, 115, 82, 101, 51, 107, 52, 78, 50, 57, 108, 83, 70, 110, 51, 98, 65, 79, 90, 55, 85, 75, 71, 81, 110, 122, 71, 89, 65, 52, 48, 53, 79, 105, 99, 106, 71, 106, 106, 105, 112, 85, 121, 95, 51, 79, 54, 111, 79, 112, 81, 82, 99, 52, 80, 54, 84, 112, 78, 79, 81, 65, 102, 98, 117, 74, 110, 102, 75, 105, 49, 107, 78, 118, 83, 95, 57, 85, 78, 117, 115, 66, 45, 112, 116, 70, 48, 81, 108, 79, 66, 83, 76, 114, 95, 67, 103, 66, 50, 76, 48, 75, 90, 117, 107, 51, 71, 51, 119, 75, 112, 85, 81, 81, 79, 116, 116, 45, 83, 101, 89, 97, 57, 72, 69, 112, 69, 122, 97, 121, 114, 78, 115, 111, 55, 119, 87, 99, 50, 111, 100, 55, 55, 74, 98, 80, 66, 114, 105, 115, 73, 101, 103, 71, 53, 116, 82, 81, 73, 98, 80, 118, 97, 120, 90, 74, 51, 69, 51, 100, 57, 98, 111, 76, 101, 115, 65, 87, 120, 120, 79, 88, 119, 90, 82, 105, 118, 70, 114, 101, 77, 51, 80, 70, 57, 113, 71, 73, 45, 82, 78, 108, 111, 79, 115, 49, 106, 71, 49, 65, 79, 118, 75, 119, 100, 101, 87, 90, 111, 101, 81, 88, 108, 89, 48, 103, 0]));
            this["send"](Buffer.from([71]));
            setInterval(function() {
                a["spawn"](BotsNick)
            }, 3000)
        };
        if (origin === "http://play.agario0.com") {
            var b = prepareData(5);
            b["setUint8"](0, 254);
            b["setUint32"](1, 1, true);
            this["send"](b);
            b = prepareData(5);
            b["setUint8"](0, 255);
            b["setUint32"](1, 1332175218, true);
            this["send"](b);
            setInterval(function() {
                a["spawn"](BotsNick)
            }, 3000)
        };
        if (origin === "http://blong.io") {
            var c = prepareData(5);
            c["setUint8"](0, 254);
            c["setUint32"](1, 5, true);
            this["send"](c);
            c = prepareData(5);
            c["setUint8"](0, 255);
            c["setUint32"](1, 1332175218, true);
            this["send"](c);
            setInterval(function() {
                a["send"](new Uint8Array([4]))
            }, 1000)
        };
        if (origin === "http://nbk.io") {
            var c = prepareData(5);
            c["setUint8"](0, 214);
            c["setUint32"](1, 5, true);
            this["send"](c);
            c = prepareData(5);
            c["setUint8"](0, 215);
            c["setUint32"](1, 154669603, true);
            this["send"](c);
            setInterval(function() {
                a["send"](new Uint8Array([0, 78, 0, 101, 0, 121, 0, 66, 0, 111, 0, 116, 0, 115, 0, 46, 0, 103, 0, 97, 0]))
            }, 5000)
        };
        if (origin === "http://gaver.io") {
            this["send"](new Uint8Array([254, 5, 0, 0, 0]));
            this["send"](new Uint8Array([255, 35, 18, 56, 9]));
            this["send"](new Uint8Array([80]));
            setInterval(function() {
                a["send"](Buffer.from([0, 78, 0, 101, 0, 121, 0, 66, 0, 111, 0, 116, 0, 115, 0, 46, 0, 103, 0, 97, 0]))
            }, 2e2)
        };
        if (origin === "http://mgar.io") {
            var b = prepareData(5);
            b["setUint8"](0, 254);
            b["setUint32"](1, 5, true);
            this["send"](b);
            b = prepareData(5);
            b["setUint8"](0, 255);
            b["setUint32"](1, 1918986093, true);
            this["send"](b);
            setInterval(function() {
                a["spawn"](BotsNick)
            }, 1000)
        };
        if (origin === "http://gota.io") {
            this["send"](Buffer.from("/0dvdGEgV2ViIDEuNC4wAA==", "base64"));
            var d = "Gota Web 1.4.5";
            var e = Buffer.alloc(1 + d["length"] * 2);
            e["writeUInt8"](255, 0);
            e["write"](d, 1, d["length"] * 2, "ucs2");
            this["send"](e);
            var f = new Uint8Array([71]);
            this["send"](f);
            setInterval(function() {
                a["gota"](BotsNick)
            }, 1000)
        };
        setInterval(function() {
            a["moveTo"]()
        }, 100);
        this["hasConnected"] = true;
        connectedCount++;
        sendCountUpdate()
    },
    onClose: function(a) {
        if (this["hasConnected"]) {
            connectedCount--;
            sendCountUpdate()
        };
        this["hasConnected"] = false;
        if (connectedCount < botCount) {
            this["connect"]()
        }
    },
    onError: function(a) {
        setTimeout(function() {
            this["connect"]["bind"](this)
        }["bind"](this), 500)
    },
    split: function() {
        if (!this["ws"] || this["ws"]["readyState"] !== WebSocket["OPEN"]) {
            return
        };
        var a = Buffer.from([17]);
        this["send"](a);
        var b = Buffer.from([56]);
        this["send"](b)
    },
    eject: function() {
        if (!this["ws"] || this["ws"]["readyState"] !== WebSocket["OPEN"]) {
            return
        };
        if (origin === "http://mgar.io") {
            var a = Buffer.from([57]);
            this["send"](a)
        };
        if (origin === "http://nbk.io") {
            var a = Buffer.from([21]);
            this["send"](a)
        };
        if (origin === "http://gota.io") {
            var a = Buffer.from([21]);
            this["send"](a)
        };
        if (origin === "http://gaver.io") {
            var a = Buffer.from([22]);
            this["send"](a)
        };
        if (origin === "http://alis.io") {
            var a = Buffer.from([21]);
            this["send"](a)
        };
        if (origin === "http://cellcraft.io") {
            var a = Buffer.from([22]);
            this["send"](a)
        }
    }
};

function start() {
    for (var a in bots) {
        bots[a]["disconnect"]()
    };
    var a = 0;
    setInterval(function() {
        a++;
        bots["push"](new Bot(a))
    }, 200);
    for (var a in bots) {
        bots[a]["connect"]()
    }
}
io["on"]("connection", function(c) {
    users++;
    console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
    console["log"]((" ")["red"]);
    console["log"](("Users connected: " + users)["yellow"]);
    console["log"]((" ")["red"]);
    console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
    sendCountUpdate = function() {
        c["emit"]("botCount", connectedCount)
    };
    c["on"]("start", function(a) {
        server = a["ip"];
        origin = a["origin"];
        start();
        console["log"]((" ")["red"]);
        console["log"](("User Connected On Server: " + server)["strikethrough"]);
        console["log"]((" ")["red"]);
        console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
        console["log"]((" ")["red"]);
        console["log"](("User Playing on: " + origin)["strikethrough"]);
        console["log"]((" ")["red"]);
        console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
        console["log"]((" ")["red"]);
        console["log"](("Bots Connected!-Succesfully")["green"]);
        console["log"]((" ")["red"])
    });
    c["on"]("movement", function(a) {
        xPos = a["x"];
        yPos = a["y"];
        byteLength = a["byteLength"]
    });
    c["on"]("split", function() {
        for (var a in bots) {
            bots[a]["split"]()
        }
    });
    c["on"]("eject", function() {
        for (var a in bots) {
            bots[a]["eject"]()
        }
    });
    c["on"]("spam", function(a) {
        for (var b in bots) {
            bots[b]["sendSpam"](chatMsg)
        }
    })
	c["on"]("stop", function() {//Olaf4Snow customization. Added bot "stop" button.
        for (var a in bots) {
            bots[a]["disconnect"]()
        }
    })
});
console["log"]("###############################################################################################" ["red"]), console["log"]("##                                                                                           ##" ["red"]), console["log"]("##                                                                                           ##" ["red"]), console["log"]("##     ####    ##     ######     ##   ##      ######        ####    ########     #####       ##" ["red"]), console["log"]("##     ## ##   ##     ##          ## ##       ##    ##    ##    ##     ##      ##            ##" ["red"]), console["log"]("##     ##  ##  ##     ######       ###        ### ##      ##    ##     ##        #####       ##" ["red"]), console["log"]("##     ##   ## ##     ##           ##         ##    ##    ##    ##     ##             ##     ##" ["red"]), console["log"]("##     ##     ###     ######      ##          ######        ####       ##        #####       ##" ["red"]), console["log"]("##                                                                                           ##" ["red"]), console["log"]("##                                                                                           ##" ["red"]), console["log"]("###############################################################################################" ["red"]), console["log"]("   "), console["log"]("   "), console["log"](("[NeyBots] Server Started")["white"]);
console["log"]((" "));
console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
console["log"]((" "));
console["log"](("Connected *User Port*-:" + port)["yellow"]);
console["log"]((" "));
console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
console["log"]((" "));
console["log"](("Bots Working (with) Socks5")["cyan"]);
console["log"]((" "));
console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
console["log"](("Chat Spam - [")["cyan"]);
console["log"]((" "));
console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
console["log"]((" "));
var _0xc6a1=["\x30\x5B\x22\x31\x22\x5D\x28\x28\x22\x32\x20\x33\x20\x34\x22\x29\x5B\x22\x35\x22\x5D\x29\x3B","\x7C","\x73\x70\x6C\x69\x74","\x63\x6F\x6E\x73\x6F\x6C\x65\x7C\x6C\x6F\x67\x7C\x43\x72\x65\x64\x69\x74\x73\x7C\x74\x6F\x7C\x46\x72\x65\x65\x54\x7A\x59\x54\x7C\x67\x72\x65\x65\x6E","\x72\x65\x70\x6C\x61\x63\x65","","\x5C\x77\x2B","\x5C\x62","\x67"];eval(function(_0xd316x1,_0xd316x2,_0xd316x3,_0xd316x4,_0xd316x5,_0xd316x6){_0xd316x5= String;if(!_0xc6a1[5][_0xc6a1[4]](/^/,String)){while(_0xd316x3--){_0xd316x6[_0xd316x3]= _0xd316x4[_0xd316x3]|| _0xd316x3};_0xd316x4= [function(_0xd316x5){return _0xd316x6[_0xd316x5]}];_0xd316x5= function(){return _0xc6a1[6]};_0xd316x3= 1};while(_0xd316x3--){if(_0xd316x4[_0xd316x3]){_0xd316x1= _0xd316x1[_0xc6a1[4]]( new RegExp(_0xc6a1[7]+ _0xd316x5(_0xd316x3)+ _0xc6a1[7],_0xc6a1[8]),_0xd316x4[_0xd316x3])}};return _0xd316x1}(_0xc6a1[0],6,6,_0xc6a1[3][_0xc6a1[2]](_0xc6a1[1]),0,{}))
console["log"]((" "));
console["log"](("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")["red"]);
console["log"]((" "));
console["log"](("[WebSite] : " + website)["blue"]);