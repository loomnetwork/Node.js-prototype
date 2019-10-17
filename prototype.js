const program = require('commander')
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const keccak256 = require('keccak256')
const { fromRpcSig } = require('ethereumjs-util')
const {
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  LocalAddress,
  CryptoUtils,
  LoomProvider,
  soliditySha3
} = require('loom-js')

const PrototypeContractjJSON = require('./build/contracts/Prototype.json')
const extdevChainId = 'extdev-plasma-us1'

async function loadExtdevAccount () {
  const privateKeyStr = fs.readFileSync(path.join(__dirname, './signer-private-key'), 'utf-8')
  const privateKey = CryptoUtils.B64ToUint8Array(privateKeyStr)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
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
  return {
    account: LocalAddress.fromPublicKey(publicKey).toString(),
    web3js: new Web3(new LoomProvider(client, privateKey)),
    client
  }
}

 async function loadRinkebyAccount() {
  const privateKey = fs.readFileSync(path.join(__dirname, './rinkeby-private-key'), 'utf-8')
  const web3js = new Web3(`https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`)
  const ownerAccount = web3js.eth.accounts.privateKeyToAccount('0x' + privateKey)
  web3js.eth.accounts.wallet.add(ownerAccount)
  return web3js
}

async function getPrototypeContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(
    PrototypeContractjJSON.abi,
    PrototypeContractjJSON.networks[networkId].address
  )
}

function buildHash(pubKey, str1, str2, address) {
  const buffer = pubKey + str1 + str2 + address
  return keccak256(buffer).toString('hex')
}

async function approve(pubKey, str1, str2, address) {
  const { account, web3js, client } = await loadExtdevAccount()
  const rinkebyWeb3js = await loadRinkebyAccount()
  const prototypeContract = await getPrototypeContract(web3js)
  
  const keccak = buildHash(pubKey, str1, str2, address)

  const result = await rinkebyWeb3js.eth.sign(keccak, account)
  const hash = '0x' + soliditySha3('\x19Ethereum Signed Message:\n32', keccak).slice(2)
  const { r, s, v } = fromRpcSig(result)

  try {
    const tx = await prototypeContract.methods
      .approve(pubKey, str1, str2, address, keccak, r, s, v, hash)
      .send({ from: account})
    console.log(tx)
    console.log('Signer address: '+ tx.events.NewDataAdded.returnValues.signer)
    console.log('PubKey: ' + tx.events.NewDataAdded.returnValues.pubKey)
    console.log('Str1: ' + tx.events.NewDataAdded.returnValues.str1)
    console.log('Str2: ' + tx.events.NewDataAdded.returnValues.str2)
    console.log('Address: ' + tx.events.NewDataAdded.returnValues.addr)
    console.log('Hash: ' + tx.events.NewDataAdded.returnValues.hash)
  } catch (err) {
    console.log('Error encountered while saving data.')
    throw (err)
  } finally {
    if (client) {
      client.disconnect()
    }
  }
}

async function recover(hash,r,s,v) {
  const { account, web3js, client } = await loadExtdevAccount()
  const prototypeContract = await getPrototypeContract(web3js)
  try {
    const tx = await prototypeContract.methods
    .recove(hash,r,s,v)
    .call({ from: account})
    console.log("tx", tx);
  } catch (err) {
    console.log('Error encountered while retrieving data.')
    throw (err)
  } finally {
    if (client) {
      client.disconnect()
    }
  }

}

async function getData(hash) {
  const { account, web3js, client } = await loadExtdevAccount()
  const prototypeContract = await getPrototypeContract(web3js)
  try {
    const tx = await prototypeContract.methods
    .getData(hash)
    .call({ from: account})
    console.log('PubKey: ' + tx.pubKey)
    console.log('Str1: ' + tx.str1)
    console.log('Str2: ' + tx.str2)
    console.log('Address:' + tx.addr)
  } catch (err) {
    console.log('Error encountered while retrieving data.')
    throw (err)
  } finally {
    if (client) {
      client.disconnect()
    }
  }

}
program
    .command('approve <pubKey> <str1> <str2> <address>')
    .description('Expects the following parameters: pubKey, str1, str2, address')
    .action(async function (pubKey, str1, str2, address) {
      await approve(pubKey, str1, str2, address)
    });

    program
    .command('getData <hash>')
    .description('Expects the following parameters: hash')
    .action(async function (hash) {
      await getData(hash)
    });

program
  .command('recove <hash> <r> <s> <v>')
  .description('Expects the following parameters: hash, r, s, v')
  .action(async function (hash,r,s,v) {
    await recover(hash,r,s,v)
});

program.parse(process.argv);