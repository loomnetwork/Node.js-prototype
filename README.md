# Node.js-prototype


## 1. Install

```bash
npm install
```

## 2. Generate deployer keys

```bash
npm run gen-keys:deployer
```

## 3. Setup the admin account

* 3.1 Save your Rinkeby private key into the `rinkeby-private-key` file.

* 3.2 Save your Rinkeby address into the `rinkeby-account` file

* 3.3 Update `adminAddress` in `./migrations/2_prototype.js` to match the address saved into the `rinkeby-account` file.

## 4. Deploy the contract

```bash
npm run migrate:testnet
```


## 5. Call approve

```bash
node prototype.js approve <publicKey> <str1> <str2> <address>
```

Example:

```
node prototype.js approve u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI= str01 str02 0x653bcf82b202dbaac4fdcee8266fc7a93cb26539
--
Signer address: 0x4d64761D2221dBc0E3dfd0aFE1A94d5f6f4Bd159
PubKey: u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI=
Str1: str01
Str2: str02
Address: 0x653bCF82B202dBAAc4fDCee8266fC7a93cB26539
Hash: 89e50bd8ad3da87b3098ea03490e8f8608339575c7da8878f684697372e40629
```

## 6. Get data

```bash
node prototype.js getData <hash>
```

Example:

```bash
node prototype.js getData 89e50bd8ad3da87b3098ea03490e8f8608339575c7da8878f684697372e40629
--
PubKey: u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI=
Str1: str01
Str2: str02
Address: 0x653bCF82B202dBAAc4fDCee8266fC7a93cB26539
```
