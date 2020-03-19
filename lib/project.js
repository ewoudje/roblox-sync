'use babel';

import fs from 'fs';
import path from 'path';
import http from 'http';

export default class Project {

  constructor(root) {
    this.root = root
    this.config = JSON.parse(fs.readFileSync(path.join(root, "roblox.json")))
    this.scriptFolder = path.join(this.root, this.config.scriptLocation)
    this.yetToSend = []
  }

  startServer() {
    const self = this
    this.http = http.createServer(function (req, res) {
      let i = 0;
      function check() {
        i++
        if (i >= 100 || self.yetToSend.length != 0) {
          res.write(JSON.stringify(self.yetToSend));
          res.end();
          self.yetToSend = []
          return
        }
        if (self.yetToSend.length == 0) setTimeout(check, 50);
      }
      check()
    }).listen(8080);
  }

  update(filepath, data) {
    if (!filepath.startsWith(this.scriptFolder)) return false
    let fp = filepath.substr(this.scriptFolder.length).split("\\").join("/")
    var output = null
    for (local in this.config.locations) {
        if (fp.endsWith(local)) {
          output = "$" + this.config.locations[local]
        }
    }
    if (output == null) output = fp;
    for (data in this.yetToSend) {
      if (data.location == output) this.yetToSend.remove(data)
    }
    this.yetToSend.push({data: data, location: output})
    return true
  }

}
