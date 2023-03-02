import { useEffect, useState, useRef } from 'react';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './ContractConfig';

function App() {
  const [isMetamask, setMetamask] = useState(false);
  const [account, setAccount] = useState(); // state variable to set account.
  const [isConnected, setIsConnected] = useState(false);

  const [isTxInprogress, setIsTxInprogress] = useState(false);

  

  let collectionNameInit = "Ikon23";
  let collectionSymbolInit = "I23";

  let tokenCollectionIdInit = 0;
  let tokenToInit = "0xF98B269dDD0604cC6711f593aEE6afe2ae38Ba67";
  let tokenIdInit = 100;
  let tokenUrlInit = "https://nfticon.io/100";

  const [collectionName, setCollectionName] = useState(collectionNameInit);
  const handleCollectionName = (event) => {
    setCollectionName(event.target.value);
  };
  const [collectionSymbol, setCollectionSymbol] = useState(collectionSymbolInit);
  const handleCollectionSymbol = (event) => {
    setCollectionSymbol(event.target.value);
  };
  
  const [tokenCollectionId, setTokenCollectionId] = useState(tokenCollectionIdInit);
  const handleTokenCollectionId = (event) => {
    setTokenCollectionId(event.target.value);
  };

  const [tokenTo, setTokenTo] = useState(tokenToInit);
  const handleTokenTo = (event) => {
    setTokenTo(event.target.value);
  };

  const [tokenId, setTokenId] = useState(tokenIdInit);
  const handleTokenId = (event) => {
    setTokenId(event.target.value);
  };

  const [tokenUrl, setTokenUrl] = useState(tokenUrlInit);
  const handleTokenUrl = (event) => {
    setTokenUrl(event.target.value);
  };

  


  const web3Ref = useRef();



  async function connectWithMetamask() {
    const web3 = web3Ref.current;

    console.log("connectWithMetamask web3", web3);
    try {
      const accounts = await web3.eth.requestAccounts();
      afterConnection(accounts[0]);
    } catch (err) {
      console.log("User rejected connection");
      alert("You need to be connected to be able to use functionality");
    }
  }

  function afterConnection(accounts0) {
    const web3 = web3Ref.current;

    console.log("afterConnection web3", web3);

    setAccount(accounts0);
    setIsConnected(true);
  }
  
  function createCollection() {
    const web3 = web3Ref.current;
    const contractFabric = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    setIsTxInprogress(true);

    contractFabric.methods.CreateNewCollection("bB1","cC2").send({from: account})
    .on('receipt', function(){
    })
    .on('error', function(error){
      setIsTxInprogress(false);
      console.log("createCollection error", error);
    })
    .then(function(receipt){
      console.log("createCollection then", receipt);
      setIsTxInprogress(false);
    });

    console.log("createCollection", web3, contractFabric);
  }

  function mintNFT() {
    const web3 = web3Ref.current;
    const contractFabric = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, { gas: '150000' });
    setIsTxInprogress(true);

    contractFabric.methods.CreateNewToken(0,"0xF98B269dDD0604cC6711f593aEE6afe2ae38Ba67",63,"https://sepolia.nft/63").send({from: account})
    .on('receipt', function(){})
    .on('error', function(error){
      console.log("mintNFT error", error);
      setIsTxInprogress(false);
    })
    .then(function(receipt){
      console.log("mintNFT then", receipt);
      setIsTxInprogress(false);
    });

  }

  async function runMain() {
    const web3 = new Web3(Web3.givenProvider);
    web3Ref.current = web3;

    console.log("runMain web3", web3);

    // TODO: we need to check is user using account, already have permission or not
    const accounts = await web3.eth.getAccounts();
    if (accounts.length>0) {
      afterConnection(accounts[0]);
    }
  }

  useEffect(() => {
    async function load() {
      if (window.ethereum) {
        setMetamask(true);
        runMain();
      }
      else {
        console.log("No Metmask found");
      }      
    }
    load();
  }, []);
  
   return (
    <div>
      {!isMetamask && (
        <div className="has-text-centered mb-4">
          <h3>You need to have Metamask enabled</h3>
        </div>
      )}

      {isTxInprogress && (
        <div className="notification is-warning">
          Transaction is in progress, please wait
        </div>
      )}

      {isMetamask && (
        <div>
          {isConnected && (
            <div className="mb-4">
              <h3 className="has-text-centered mb-4">Connected with account: {account}</h3>


<div className="field has-addons has-addons-centered mb-4">
  <div className="control">
    Name
  </div>
  <div className="control">
    <input className="input" type="text" placeholder="Name" onChange={handleCollectionName} value={collectionName} />
  </div>
  <div className="control">
    Symbol
  </div>
  <div className="control">
    <input className="input" type="text" placeholder="Symbol" onChange={handleCollectionSymbol} value={collectionSymbol} />
  </div>
  <div className="control">
    <button className="button is-info" onClick={() => createCollection()}>
    Create collection
    </button>
  </div>
</div>

<div className="field has-addons has-addons-centered mb-4">
  <div className="control">
    Collection Id
  </div>
  <div className="control">
    <input className="input" type="text" placeholder="Collection Id" onChange={handleTokenCollectionId} value={tokenCollectionId} />
  </div>
  <div className="control">
    To
  </div>
  <div className="control">
    <input className="input" type="text" placeholder="To address" onChange={handleTokenTo} value={tokenTo} />
  </div>
  <div className="control">
    Token Id
  </div>
  <div className="control">
    <input className="input" type="text" placeholder="Token Id" onChange={handleTokenId} value={tokenId} />
  </div>
  <div className="control">
    Token URL
  </div>
  <div className="control">
    <input className="input" type="text" placeholder="Token URL" onChange={handleTokenUrl} value={tokenUrl} />
  </div>
  <div className="control">
    <button className="button is-info" onClick={() => mintNFT()}>
      Mint NFT
    </button>
  </div>
</div>

            </div>
          )}
          {!isConnected && (
            <div className="mb-4">
              <h3 className="has-text-centered">Not connected</h3>
              <div className="has-text-centered mt-4">
                <button onClick={() => connectWithMetamask()} className="button is-primary">Connect with Metamask</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
   );
}

export default App;