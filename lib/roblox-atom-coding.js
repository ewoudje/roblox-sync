'use babel';

import { CompositeDisposable, File } from 'atom';
import Project from './project'

const fs = require('fs')
const path = require('path')

export default {
  subscriptions: null,
  project: null,
  projectPath: null,

  findProjectPath() {
    const t = this;
    atom.project.getPaths().forEach((p) => {
      if (fs.existsSync(path.join(p, "roblox.json"))) t.projectPath = p;
    })
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    const t = this

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'roblox-atom-coding:setup-sync': () => this.setup_sync()
      }),
      atom.commands.add('atom-workspace', {
        'roblox-atom-coding:resync': () => this.resync()
      }),

      atom.project.onDidChangePaths(paths => {
        this.findProjectPath()
      }),

      atom.workspace.onDidAddTextEditor((editor) => {
        if (t.project != null) t.project.update(editor.getPath(), editor.getBuffer().getText())
        this.subscriptions.add(editor.getBuffer().onDidSave((path) => {
          if (t.project != null) t.project.update(path, editor.getBuffer().getText());
        }))
      })
    )

    atom.workspace.getTextEditors().forEach((editor) => {
      this.subscriptions.add(editor.getBuffer().onDidSave((path) => {
      if (t.project != null) t.project.update(path.path, editor.getBuffer().getText());
    }))})
    this.findProjectPath()

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  setup_sync() {
    if (this.projectPath == null) return;
    console.log('Roblox Atom Plugin will now start the sync-server');
    this.project = new Project(this.projectPath)
    this.project.startServer()
    const t = this
    atom.workspace.getTextEditors().forEach((editor) => t.project.update(editor.getPath(), editor.getBuffer().getText()))
  },

  resync() {
    this.project.resync()
  }

};
