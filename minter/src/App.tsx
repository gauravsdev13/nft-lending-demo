import { useSDK } from "@metamask/sdk-react";
import React, { useState } from "react";
import Web3 from 'web3';
import ERC721ABI from './contract_abi/ERC721ABI.json'

export const App = () => {
  const [account, setAccount] = useState<string>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const URI = 'ipfs://QmX1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x0y8z9a0b'

  const connect = async () => {
    try {
      const accounts = await (sdk?.connect() as Promise<string[]>);
      setAccount(accounts?.[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const mintNFT = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const contract = new web3.eth.Contract(ERC721ABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
        await contract.methods.mint(account, URI).send({ from: account })
          .then((newItemId) => {
            alert('NFT minted successfully! Token ID: ');
          })

      } catch (error) {
        console.error(error);
        alert('Failed to mint NFT');
      }
    } else {
      alert('Please install MetaMask extension');
    }
  };


  return (
    <div className="App">
      <h1>NFT Minter</h1>
      <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect
      </button>
      {connected && (
        <div>

          {chainId && `Connected chain: ${chainId}`} <br />
          {account && `Connected account: ${account}`} <br />


          <button style={{ padding: 10, margin: 10 }} onClick={mintNFT}>
            Mint
          </button>
        </div>

      )}
    </div>
  );
};

export default App;
