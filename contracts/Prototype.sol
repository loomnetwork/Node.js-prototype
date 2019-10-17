pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract Prototype {
  // approve, takes in a public key, a few string fields name, address, hash. 
  // Then a signature of the public key they can be verified
  using ECDSA for bytes32;

  struct Data {
    string pubKey;
    string str1;
    string str2;
    address addr;
    bool isSet;
  }

  event NewDataAdded(address signer, string pubKey, string str1, string str2, address addr, string hash);

  mapping (string => Data) myData;

  function recover (bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return _hash.recover(_signature);
  }

  function approve (string memory _pubKey, string memory _str1, string memory _str2, address _addr, string memory _hash) public {
      require(myData[_hash].isSet == false, "Key already exists!");
      myData[_hash] = Data(_pubKey, _str1, _str2, _addr, true);
      emit NewDataAdded(msg.sender, _pubKey, _str1, _str2, _addr, _hash);
    }

  function getData (string memory _hash) public view returns (string memory pubKey, string memory str1, string memory str2, address addr) {
    Data memory retVal;
    retVal = myData[_hash];
    pubKey = retVal.pubKey;
    str1 = retVal.str1;
    str2 = retVal.str2;
    addr = retVal.addr;
   }

}