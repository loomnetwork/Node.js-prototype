pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract Prototype {
  // approve, takes in a public key, a few string fields name, address, hash. 
  // Then a signature of the public key they can be verified
  using ECDSA for bytes32;

  function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return _hash.recover(_signature);
  }

  function approve (
    string memory _pubKey,
    string memory _str1,
    string memory _str2,
    address _addr,
    bytes32 hash)
    public {

    }
}