pragma solidity >=0.5.0 <0.6.0;

contract Prototype {
  struct Data {
    string pubKey;
    string str1;
    string str2;
    address addr;
    bool isSet;
  }

  event NewDataAdded(address signer, string pubKey, string str1, string str2, address addr, string hash);

  mapping (string => Data) myData;

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
        result := mload(add(source, 32))
        }
    }


  function approve (string memory _pubKey, string memory _str1, string memory _str2, address _addr, string memory _hash, bytes32 r, bytes32 s, uint8 v, string memory signatureHash) public {
    require(ecrecover(stringToBytes32(signatureHash), v, r, s) == msg.sender, "Invalid signature");
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

   function recover(bytes32 _hash, bytes32 r, bytes32 s, uint8 v) public returns (address sign) {
    sign = ecrecover(_hash, v, r, s);
  }

}