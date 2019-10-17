pragma solidity >=0.5.0 <0.6.0;

contract Prototype {
  struct Data {
    string pubKey;
    string str1;
    string str2;
    address addr;
    bool isSet;
  }
  address public ADMIN;
  event NewDataAdded(address approver, string pubKey, string str1, string str2, address addr, bytes32 hash);
  mapping (bytes32 => Data) myData;

  constructor(address _admin) public {
    ADMIN = _admin;
  }


  function approve (string memory _pubKey, string memory _str1, string memory _str2, address _addr, bytes32 _hash) public {
    require(myData[_hash].isSet == false, "Key already exists!");
    myData[_hash] = Data(_pubKey, _str1, _str2, _addr, true);
    emit NewDataAdded(msg.sender, _pubKey, _str1, _str2, _addr, _hash);
  }

  function approve (string memory _pubKey, string memory _str1, string memory _str2, address _addr, bytes32 _hash, bytes32 r, bytes32 s, uint8 v) public {
    require(ecrecover(_hash, v, r, s) == address(ADMIN), "Invalid signature");
    require(myData[_hash].isSet == false, "Key already exists!");
    myData[_hash] = Data(_pubKey, _str1, _str2, _addr, true);
    emit NewDataAdded(msg.sender, _pubKey, _str1, _str2, _addr, _hash);
  }

  function getData (bytes32 _hash) public view returns (string memory pubKey, string memory str1, string memory str2, address addr) {
    Data memory retVal;
    retVal = myData[_hash];
    pubKey = retVal.pubKey;
    str1 = retVal.str1;
    str2 = retVal.str2;
    addr = retVal.addr;
   }

  function recover(bytes32 _hash, bytes32 r, bytes32 s, uint8 v) public view returns (address sign, bytes32 oh, bytes32 or, bytes32 os, uint8 ov ) {
    sign = ecrecover(_hash, v, r, s);
  }
}
