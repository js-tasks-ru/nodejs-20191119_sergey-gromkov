const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  #memory = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const lines = data.split(os.EOL);
    const linesLength = lines.length;

    for (let i = 0; i < linesLength; i++) {
      const line = lines[i];
      const lastLine = (i + 1 === linesLength);

      this.addToMemory(line);

      if (!lastLine) {
        this.push(this.getMemory());
        this.cleanMemory();
      }
    }

    callback(null);
  }

  _flush(callback) {
    const memory = this.getMemory();

    if (memory.length) {
      this.push(memory);
      this.cleanMemory();
    }

    callback(null);
  }

  addToMemory(data) {
    this.#memory += data;
  }

  cleanMemory() {
    this.#memory = '';
  }

  getMemory() {
    return this.#memory;
  }
}

module.exports = LineSplitStream;
