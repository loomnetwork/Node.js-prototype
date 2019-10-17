# Node.js-prototype


## 1. Install

```bash
npm install
```

## 2. Generate deployer keys

```bash
npm run gen-keys:deployer
```

## 3. Deploy the contract

```bash
npm run migrate:testnet
```

## 4. Generate signer keys

```bash
npm run gen-keys:signer
```

## 5. Print singer public key

```bash
cat signer-public-key
```

## 6. Generate test account

```bash
node scripts/gen-keys.js test
```

This will create three files: `test-private-key`, `test-public-key`, and `test-account`.

## 7. Call approve

```bash
node prototype.js approve <publicKey> <str1> <str2> <address>
```

Example:

```
node prototype.js approve u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI= str01 str02 0x653bcf82b202dbaac4fdcee8266fc7a93cb26539
Signer address: 0x4d64761D2221dBc0E3dfd0aFE1A94d5f6f4Bd159
PubKey: u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI=
Str1: str01
Str2: str02
Address: 0x653bCF82B202dBAAc4fDCee8266fC7a93cB26539
Hash: 89e50bd8ad3da87b3098ea03490e8f8608339575c7da8878f684697372e40629
```

## 7. Get data

```bash
node prototype.js getData <hash>
```

Example:

```bash
node prototype.js getData 89e50bd8ad3da87b3098ea03490e8f8608339575c7da8878f684697372e40629
PubKey: u1F3RvRvW9v4X/dIZSpbW6a+r5XZ2pgM9508l8T6AYI=
Str1: str01
Str2: str02
Address:0x653bCF82B202dBAAc4fDCee8266fC7a93cB26539
```
