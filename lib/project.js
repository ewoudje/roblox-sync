'use babel';

import fs from 'fs';
import path from 'path';
import http from 'http';
import glob from 'glob';

export default class Project {

  constructor(root) {
    this.root = root
    this.config = JSON.parse(fs.readFileSync(path.join(root, "roblox.json")))
    this.scriptFolder = path.join(this.root, this.config["script-folder"])
    this.yetToSend = []
    this.scriptMap = {}
    this.resync()
  }

  resync() {
    this.resynce = true
    this.findScripts()
  }

  findScripts() {
    const self = this
    glob(self.scriptFolder + '/**/*.lua', (er, filepaths) => {
      if (filepaths != null) {
        for (var filepath of filepaths) {
          let fp = filepath.substr(self.scriptFolder.length).split("\\").join("/")
          var output = null
          const data = fs.readFileSync(filepath, "utf8")
          if (data.startsWith("--#")) {
            const loc = data.indexOf("#--")
            output = data.substr(3, loc - 3)
          } else {
            for (local in this.config.locations) {
                if (fp.endsWith(local)) {
                  output = "$" + self.config.locations[local]
                }
            }
          }
          if (output == null) output = "$" + fp.split("/").join(".")

          this.scriptMap[filepath] = output
        }
      }
    })
  }

  startServer() {
    const self = this
    this.http = http.createServer(function (req, res) {

      if (req.method == "GET") {
        if (self.resynce) {
          self.resynce = false
          res.write(JSON.stringify({ctype: "SENDALL"}));
          res.end()
          return
        }

        let i = 0;
        function check() {
          i++
        if (i >= 100 || self.yetToSend.length != 0) {
            res.write(JSON.stringify({ctype: "SYNC", data: self.yetToSend}))
            res.end()
            self.yetToSend = []
            return
          }
          if (self.yetToSend.length == 0) setTimeout(check, 50)
        }

        check()
      } else if (req.method == "POST") {
        var body = ''
        req.on('data', function(data) {
          body += data
        })
        req.on('end', function() {
          const data = JSON.parse(body)

          res.writeHead(200, {'Content-Type': 'application/json'})

          if (data.ctype == "SENDALL") {
            for (const entry of data.data) {
              const found = self.getFScriptPath("$" + entry.location)
              fs.writeFile(found || path.join(self.scriptFolder, entry.file), (found ? "" : "--#$" + entry.location + "#--\n") + entry.source, () => {})
            }

            res.write(JSON.stringify({response: "OK"}))
          } else {
            res.write(JSON.stringify({response: "ERROR"}))
            console.error("INVALID DATA TYPE")
          }

          res.end()
          return
        })
      }
    }).listen(8080);
  }

  getRScriptPath(file) {
    return this.scriptMap[file]
  }

  getFScriptPath(file) {
    for (const [key, value] of Object.entries(this.scriptMap)) {
      if (file == value) {
        return key
      }
    }
  }

  update(filepath, data) {
    const output = this.getRScriptPath(filepath)
    if (!output) return false
    for (data in this.yetToSend) {
      if (data.location == output) this.yetToSend.remove(data)
    }
    this.yetToSend.push({data: data, location: output})
    return true
  }

}
