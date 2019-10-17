const LoomTruffleProvider = require('loom-truffle-provider')
const {
  readFileSync
} = require('fs')
const path = require('path')

module.exports = {
  networks: {
    extdev: {
      provider: function () {
        const privateKey = readFileSync(path.join(__dirname, 'deployer-private-key'), 'utf-8')
        const chainId = 'extdev-plasma-us1'
        const writeUrl = 'wss://extdev-plasma-us1.dappchains.com/websocket'
        const readUrl = 'wss://extdev-plasma-us1.dappchains.com/queryws'
        return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
      },
      network_id: '9545242630824'
    },
  },
  compilers: {
    solc: {
      version: '0.5.0'
    }
  }
}