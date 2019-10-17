const { CryptoUtils } = require('loom-js')
const fs = require('fs')

const filename = process.argv[2]

const privateKey = CryptoUtils.generatePrivateKey()
const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
fs.writeFileSync(filename, privateKeyString)