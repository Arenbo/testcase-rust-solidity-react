// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Collection.sol";

contract CollectionFactory {
  Collection[] public Collections;

  event CollectionCreated(
    address adr,
    string name,
    string symbol
  );

  event TokenMinted(
    address adr,
    address to,
    uint256 tokenId,
    string tokenUri
  );

  function CreateNewCollection(string memory _name, string memory _symbol) public {
    Collection collection = new Collection(_name, _symbol);

    emit CollectionCreated(address(collection), _name, _symbol);

    Collections.push(collection);
  }

  function CreateNewToken(uint _collectionId, address _to, uint256 _tokenId, string memory _tokenUri) public {
    Collection collection = Collections[_collectionId];

    collection.safeMint(_to, _tokenId, _tokenUri);

    emit TokenMinted(address(collection), _to, _tokenId, _tokenUri);
  }
}