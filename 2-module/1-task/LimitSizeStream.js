const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #limit = 0;
  #encoding = 'utf-8';
  #emount = 0;

  constructor(options) {
    super(options);

    if (options.limit) {
      this.#limit = options.limit;
    }

    if (options.encoding) {
      this.#encoding = options.encoding;
    }
  }

  _transform(chunk, encoding, callback) {
    let error = null;

    this.#emount += chunk.length;

    if (this.#emount <= this.#limit) {
      this.push(chunk.toString(this.#encoding));
    } else {
      error = new LimitExceededError();
    }

    callback(error);
  }
}

module.exports = LimitSizeStream;
