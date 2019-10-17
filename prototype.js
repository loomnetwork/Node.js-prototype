const program = require('commander')
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const keccak256 = require('keccak256')

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
  const prototypeContract = await getPrototypeContract(web3js)
  
  const hash = buildHash(pubKey, str1, str2, address)
  const signature = await web3js.eth.sign(hash, account)
  console.log('Signature: ' + signature)
  let r = signature.substr(0, 66)
  let s = '0x' + signature.substr(66, 64)
  let v = '0x' + signature.substr(130, 2)

  console.log("account", account);
  console.log("r", r);
  console.log("s", s);
  console.log("v", v);
  
  try {
    const tx = await prototypeContract.methods
      .approve(pubKey, str1, str2, address, hash, r, s, v)
      .send({ from: account})

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

async function recove(hash,r,s,v) {
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
      await recove(hash,r,s,v)
    });


program.parse(process.argv);