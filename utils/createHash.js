const crypto = require("crypto");

const hashString = (string) => {
  crypto.createHash("md5").update(string).digest("hex");
  // m5 a type of hash pattern
  // digest = store, in hex string
};

module.exports = hashString;
