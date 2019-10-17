  
const Prototype = artifacts.require('./Prototype.sol')

module.exports = function (deployer, network, accounts) {
  if (network !== 'extdev') {
    return
  }

  deployer.then(async () => {
    let adminAddress = '0xC4247A24E4356FA34475799d9e64719e5307146c'
    await deployer.deploy(Prototype, adminAddress)
    const prototypeInstance = await Prototype.deployed()

    console.log('\n*************************************************************************\n')
    console.log(`Prototype Contract Address: ${prototypeInstance.address}`)
    console.log('\n*************************************************************************\n')
  })
}