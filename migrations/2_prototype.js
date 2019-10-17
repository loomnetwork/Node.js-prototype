  
const Prototype = artifacts.require('./Prototype.sol')

module.exports = function (deployer, network, accounts) {
  if (network !== 'extdev') {
    return
  }

  deployer.then(async () => {
    await deployer.deploy(Prototype)
    const prototypeInstance = await Prototype.deployed()

    console.log('\n*************************************************************************\n')
    console.log(`Prototype Contract Address: ${prototypeInstance.address}`)
    console.log('\n*************************************************************************\n')
  })
}