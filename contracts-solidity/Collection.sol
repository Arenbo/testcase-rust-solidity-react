// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collection is ERC721, ERC721URIStorage, Ownable {
  string private name;
  string private symbol;

  constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    name = _name;
    symbol = _symbol;
  }

  function safeMint(address to, uint256 tokenId, string memory uri)
      public
      onlyOwner
  {
      _safeMint(to, tokenId);
      _setTokenURI(tokenId, uri);
  }

  // The following functions are overrides required by Solidity.

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
      super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
      public
      view
      override(ERC721, ERC721URIStorage)
      returns (string memory)
  {
      return super.tokenURI(tokenId);
  }
}