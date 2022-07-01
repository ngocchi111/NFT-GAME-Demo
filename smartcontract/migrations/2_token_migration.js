const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token);

  let tokenInstance = await Token.deployed();
  await tokenInstance.setAdmin({ value: web3.utils.toWei("10", 'ether') });

  var url = './data.json'
  const jsonData = require(url);

  for (var i in jsonData) {
    var loop = parseInt(i);

    await tokenInstance.mint();
    var price = jsonData[loop]['price'];
    var priceInWei = web3.utils.toWei(price, 'ether');

    await tokenInstance.setPrice(loop + 1, priceInWei)
  }
};