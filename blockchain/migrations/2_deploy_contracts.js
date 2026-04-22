const SecureTransaction = artifacts.require("SecureTransaction");

module.exports = function (deployer) {
  deployer.deploy(SecureTransaction);
};
