const program = require('commander')
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const keccak256 = require('keccak256')
const ethers = require('ethers')

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
    client,
  }
}
async function getPrototypeContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(
    PrototypeContractjJSON.abi,
    PrototypeContractjJSON.networks[networkId].address
  )
}

function buildHash(ethers, pubKey, str1, str2, address) {
  let result = ethers.utils.solidityKeccak256([ 'string', 'string', 'string', 'address' ], [ pubKey, str1, str2, address ]);
  return result
}

function loadAdminCredentials () {
  const addr = fs.readFileSync(path.join(__dirname, './rinkeby-account'), 'utf-8')
  const ethPrivateKey = fs.readFileSync(path.join(__dirname, './rinkeby-private-key'), 'utf-8')
  return {addr, ethPrivateKey}
}

async function approve(pubKey, str1, str2, address) {
  const { account, web3js, client, privateKey } = await loadExtdevAccount()
  const prototypeContract = await getPrototypeContract(web3js)
  const hash = buildHash(ethers, pubKey, str1, str2, address)
  const { addr, ethPrivateKey } = loadAdminCredentials()
  const ethWallet = new ethers.Wallet(ethPrivateKey);
  const signature = await ethWallet.signMessage(hash);
  let signedHash = ethers.utils.hashMessage(hash)
  let r = signature.slice(0, 66)
  let s = '0x' + signature.slice(66, 130)
  let v = '0x' + signature.slice(130, 132)

  let splitResults = ethers.utils.splitSignature(signature)
  
  try {
    const tx = await prototypeContract.methods
      .approve(pubKey, str1, str2, address, signedHash, splitResults.r, splitResults.s, splitResults.v)
      .send({ from: account})

    console.log('Approver: '+ tx.events.NewDataAdded.returnValues.approver)
    console.log('PubKey: ' + tx.events.NewDataAdded.returnValues.pubKey)
    console.log('Str1: ' + tx.events.NewDataAdded.returnValues.str1)
    console.log('Str2: ' + tx.events.NewDataAdded.returnValues.str2)
    console.log('Address: ' + tx.events.NewDataAdded.returnValues.addr)
    console.log('Hash: ' + tx.events.NewDataAdded.returnValues.hash)
    console.log('TxHash: ' + tx.transactionHash)
    console.log('BlockNumber: ' + tx.blockNumber)
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

async function recover(hash,r,s,v) {
  const { account, web3js, client } = await loadExtdevAccount()
  const prototypeContract = await getPrototypeContract(web3js)
  try {
    const tx = await prototypeContract.methods
    .recover(hash,r,s,v)
    .call({ from: account})
    return tx
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


program.parse(process.argv);
