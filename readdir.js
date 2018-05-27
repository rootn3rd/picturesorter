var fs = require('fs');
var p = require('path');
// var sharp = require('sharp');

function readdir(path, ignores, callback) {
  if (!callback) {
    return new Promise((res, rej) => {
      readdir(path, ignores || [], function(err, data) {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
  }
  var list = [];
  fs.readdir(path, function(err, files) {
    if (err) {
      console.log('Error while reading :', err);
      return callback(err);
    }

    var pending = files.length;
    if (!pending) {
      return callback(null, list);
    }

    files.forEach(function(file) {
      var filePath = p.join(path, file);

      fs.stat(filePath, (statError, stat) => {
        if (statError) {
          return callback(statError);
        }

        if (stat.isDirectory()) {
          readdir(filePath, ignores, (_err, res) => {
            if (_err) {
              return callback(_err);
            }

            list = list.concat(res);
            pending -= 1;
            if (!pending) {
              return callback(null, list);
            }
          });
        } else {
          list.push({
            name: file,
            path: filePath
          });
          pending -= 1;
          if (!pending) {
            return callback(null, list);
          }
        }
      });
    });
  });
}

module.exports = readdir;

// readdir('C:/Pankaj/delete', null, (error, list) => {
//   console.log('Error:', error);
//   console.log('list:', list);
// });
