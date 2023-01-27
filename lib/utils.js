const { eachKey } = require("lazy-z");
const { messages } = require("./constants");

/**
 * get key value pair of messages when building tests
 * @param {string} type can be plan or state
 * @param {string} attribute Name of the attribute to check
 * @param {string} address Resource Address
 * @param {string} key key at which the address is found
 * @param {number=} index Index of the instance, only used in state tests
 * @param {string=} value Value at index, only used in state test
 * @returns {{name: string, fnMessage: string, equalMessage: string, undefinedMessage: string}}
 */
function getMessages(type, attribute, address, key, index, value) {
  let sendMessages = {};
  eachKey(messages[type], (messageName) => {
    sendMessages[messageName] = messages[type][messageName]
      .replace("$attribute", attribute)
      .replace("$address", address)
      .replace("$key", key)
      .replace(/\$index/g, index)
      .replace("$value", value);
  });
  return sendMessages;
}

module.exports = {
  getMessages,
};
