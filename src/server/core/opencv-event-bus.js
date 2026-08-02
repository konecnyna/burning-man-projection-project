const { spawn } = require('child_process');
const path = require('path');

class OpenCvEventBus {
  constructor(io, state) {
    this.io = io;
    this.state = state;
    this.pythonProcess = null;
    this.restartTimeout = null;

    this.restartDelay = 10000;
  }

  start() {
    const args = ['/Users/atlantis/code/burning-man-2024/src/cv/main.py'];
    if (this.state.isMockMode) {
      args.push("--mock-mode");
    }

    if (this.state.showVideo) {
      args.push("--show-cv");
    }

    if (this.state.debugging) {
      args.push("--debug");
    }

    if (this.state.rtspUrl) {
      args.push("--url", this.state.rtspUrl);
    }

    console.log(`Starting script: python3 ${args.join(" ")}`);
    this.pythonProcess = spawn('/usr/bin/python3', args, { cwd: path.join(__dirname, '../../cv') });

    this.pythonProcess.stdout.on('data', (data) => {
      try {
        const lines = data.toString().split("\n").filter(it => it);
        lines.forEach(line => {
          if (this.state.debugging) {
            console.log(`🐍 ${line.trim()}`);
          }
        });

      } catch (e) {
        console.error("ERROR", data.toString().split("\n"), data.toString());
      }
    });

    this.pythonProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      console.error(`Python error: ${error}`);
      this.io.emit('pythonError', error);
    });

    this.pythonProcess.on('close', (code) => {
      this.io.emit('pythonClose', { code });

      if (code > 0) {
        console.log(`🚨🚨🚨🚨🚨\nPython script crashed. Retrying in 10 seconds...\n${code}\n🚨🚨🚨🚨🚨`);
        this.restartTimeout = setTimeout(() => this.start(), this.restartDelay);
      }
    });
  }

  stop() {
    if (this.pythonProcess) {
      this.pythonProcess.kill('SIGINT');
      clearTimeout(this.restartTimeout);
    }
  }
}

module.exports = OpenCvEventBus;