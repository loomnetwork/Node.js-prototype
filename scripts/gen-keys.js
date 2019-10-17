const { CryptoUtils, LocalAddress } = require('loom-js')
const fs = require('fs')

const filename = process.argv[2]

const privateKey = CryptoUtils.generatePrivateKey()
const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
fs.writeFileSync(filename + '-private-key', privateKeyString)

const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
const publicKeyString = CryptoUtils.Uint8ArrayToB64(publicKey)
fs.writeFileSync(filename + '-public-key', publicKeyString)

const account = LocalAddress.fromPublicKey(publicKey).toString()
fs.writeFileSync(filename + '-account', account)
