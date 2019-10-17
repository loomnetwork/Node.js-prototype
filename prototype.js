const program = require('commander')
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const {
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  LocalAddress,
  CryptoUtils,
  LoomProvider,
} = require('loom-js')

const PrototypeContractjJSON = require('./build/contracts/Prototype.json')
const extdevChainId = 'extdev-plasma-us1'

async function loadExtdevAccount () {
  const privateKeyStr = fs.readFileSync(path.join(__dirname, './signer-private-key'), 'utf-8')
  const privateKey = CryptoUtils.B64ToUint8Array(privateKeyStr)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  console.log(publicKey.toString())
  const client = new Client(
    extdevChainId,
    'wss://extdev-plasma-us1.dappchains.com/websocket',
    'wss://extdev-plasma-us1.dappchains.com/queryws'
  )
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ]
  client.on('error', msg => {
    console.error('PlasmaChain connection error', msg)
  })
  console.log(LocalAddress.fromPublicKey(publicKey).toString())
  return {
    account: LocalAddress.fromPublicKey(publicKey).toString(),
    web3js: new Web3(new LoomProvider(client, privateKey)),
    client
  }
}
async function getPrototypeContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(
    PrototypeContractjJSON.abi,
    PrototypeContractjJSON.networks[networkId].address
  )
}

async function approve() {
  const { account, web3js, client } = await loadExtdevAccount()
  const prototypeContract = await getPrototypeContract(web3js)

  client.disconnect()
}


approve( )