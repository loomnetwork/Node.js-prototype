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
  let pk = CryptoUtils.bytesToHex(privateKey)


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

async function approve(pubKey, str1, str2, address) {
  const { account, web3js, client, privateKey } = await loadExtdevAccount()
  const prototypeContract = await getPrototypeContract(web3js)
  console.log("account...",account);
  
  const hash = buildHash(ethers, pubKey, str1, str2, address)
  console.log("hash:", hash);
  
  let addr = '0xC4247A24E4356FA34475799d9e64719e5307146c'
  let ethPrivateKey = '0xA6E4AF5B2B8323E965876D94D9CE635723A8A7193E61000D241CDDEAA613F3E4'
  const ethWallet = new ethers.Wallet(ethPrivateKey);
  let addrs = await ethWallet.getAddress()
  console.log("addrs", addrs);
  
  const signature = await ethWallet.signMessage(hash);
  let signedHash = ethers.utils.hashMessage(hash)
  console.log("signedHash",signedHash);
  console.log('Signature: ' + signature)
  let r = signature.slice(0, 66)
  let s = '0x' + signature.slice(66, 130)
  let v = '0x' + signature.slice(130, 132)

  let splitResults = ethers.utils.splitSignature(signature)
  
  try {
    const tx = await prototypeContract.methods
      .approve(pubKey, str1, str2, address, signedHash, splitResults.r, splitResults.s, splitResults.v)
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

    program
    .command('recove <hash> <r> <s> <v>')
    .description('Expects the following parameters: hash, r, s, v')
    .action(async function (hash,r,s,v) {
      await recove(hash,r,s,v)
    });


program.parse(process.argv);