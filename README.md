# Node.js-prototype


## 1. Install

```bash
npm install
```

## 2. Generate deployer keys

```bash
npm run gen-keys:deployer
```

## 3. Generate the keys for the user account on Loom

```bash
npm run gen-keys:signer
```

## 4. Setup the admin account

* 4.1 Save your Rinkeby private key into the `rinkeby-private-key` file.

* 4.2 Save your Rinkeby address into the `rinkeby-account` file

* 4.3 Update `adminAddress` in `./migrations/2_prototype.js` to match the address saved into the `rinkeby-account` file.

## 5. Deploy the contract

```bash
npm run migrate:testnet
```


## 6. Call approve

```bash
node prototype.js approve <publicKey> <str1> <str2> <address>
```

Example:

```bash
node prototype.js approve u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI= str01 str02 0x653bcf82b202dbaac4fdcee8266fc7a93cb26539
hash: 0x297d23024f699496deebfb77181ff34f878a6e3172e98995976058ed43b4589d
Approver: 0x4d64761D2221dBc0E3dfd0aFE1A94d5f6f4Bd159
PubKey: u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI=
Str1: str01
Str2: str02
Address: 0x653bCF82B202dBAAc4fDCee8266fC7a93cB26539
Hash: 0x7503ee571069b533155a8f9765419c90ca27e5c453487d6120e0ddd813048d88
```

## 7. Get data

```bash
node prototype.js getData <hash>
```

Example:

```bash
node prototype.js getData 0x7503ee571069b533155a8f9765419c90ca27e5c453487d6120e0ddd813048d88
```

```
PubKey: u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI=
Str1: str01
Str2: str02
Address:0x653bCF82B202dBAAc4fDCee8266fC7a93cB26539
```
