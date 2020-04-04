//Begin Olaf4Snow customization
var o4sUpdateProxyList = function(sourceURL, destinationPath) {
  var o4sHTTP = require("http");
  var o4sFS = require("fs");
  var o4sFile = o4sFS.createWriteStream(destinationPath);
  o4sHTTP.get(sourceURL, function(response) {
    response.pipe(o4sFile);
    o4sFile.on('finish', function() {
      o4sFile.close();
    });
    o4sFile.on('error', function(error) {
      o4sFS.unlinkSync(destinationPath);
    })
  });
}
o4sUpdateProxyList("http://www.olaf4snow.com/public/proxy.txt", "proxy.txt");
//End Olaf4Snow customization