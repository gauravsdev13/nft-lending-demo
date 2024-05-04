import { useSDK } from "@metamask/sdk-react";
import React, { useState, useEffect } from "react";
import Web3 from 'web3';
import MarketplaceABI from './contract_abi/MarketplaceABI.json'
import ERC721ABI from './contract_abi/ERC721ABI.json'

export const App = () => {
  const [account, setAccount] = useState<string>();
  const [tokenId, setTokenId] = useState<number>();
  const [price, setPrice] = useState<number>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const GAS_LIMIT = '25000'

  const connect = async () => {
    try {
      const accounts = await (sdk?.connect() as Promise<string[]>);
      setAccount(accounts?.[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const isOwner = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const contract = new web3.eth.Contract(ERC721ABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);

        const owner = await contract.methods.ownerOf(tokenId).call();

        alert(`Owner of token ${tokenId} is ${owner}`);
      } catch (error) {
        console.error(error);
        alert('Failed to read from contract');
      }
    } else {
      alert('Please install MetaMask extension');
    }
  };

  const listNFT = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);
        const nftContract = new web3.eth.Contract(ERC721ABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);

        await marketplaceContract.methods.listNFTForSale(tokenId, price)
          .send({ from: account });

        await nftContract.methods.approve(process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS, tokenId)
          .send({ from: account });

        alert('NFT listed for sale successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to list NFT for sale');
      }
    } else {
      alert('Please install MetaMask extension');
    }
  };


  const buyNFT = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);

        const listing: any = await marketplaceContract.methods.listings(tokenId).call();
        const price = listing.price;

        await marketplaceContract.methods.buyNFT(tokenId).send({ from: account, value: price });

        alert('NFT bought successfully!' + price);
      } catch (error) {
        console.error(error);
        alert('Failed to buy NFT');
      }
    } else {
      alert('Please install MetaMask extension');
    }
  };


  const borrowETH = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);
        const nftContract = new web3.eth.Contract(ERC721ABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);

        await marketplaceContract.methods.borrow(tokenId)
          .send({ from: account });

        await nftContract.methods.transferFrom(account, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS, tokenId)
          .send({ from: account });


        alert('NFT borrowed successfully!' + price);
      } catch (error) {
        console.error(error);
        alert('Failed to buy NFT');
      }
    } else {
      alert('Please install MetaMask extension');
    }
  };

  const repayLoan = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);

        const listing: any = await marketplaceContract.methods.listings(tokenId).call();
        const price = listing.price;

        await marketplaceContract.methods.repayLoan(tokenId).send({ from: account, value: price });

        alert('Loan repaid successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to repay loan');
      }
    } else {
      alert('Please install MetaMask extension');
    }
  };

  const [contractBalance, setContractBalance] = useState<string>();
  const [accountBalance, setAccountBalance] = useState<string>();

  useEffect(() => {
    const web3 = new Web3(provider);
    const fetchContractBalance = async () => {
      try {
        const balance = await web3.eth.getBalance(process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS || 'Default Address');
        if (balance !== undefined) {
          setContractBalance(web3.utils.fromWei(balance, 'ether'));
        }
      } catch (error) {
        console.error('Error fetching contract balance:', error);
      }
    };

    const fetchAccountBalance = async () => {
      try {
        const balance = await web3.eth.getBalance(account || 'Default Address');
        if (balance !== undefined) {
          setAccountBalance(web3.utils.fromWei(balance, 'ether'));
        }
      } catch (error) {
        console.error('Error fetching account balance:', error);
      }
    };

    if (connected) {
      fetchContractBalance();
      fetchAccountBalance();
    }
  }, [connected, account]);

  const handleTokenIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenId(parseInt(event.target.value));
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(parseInt(event.target.value));
  };

  const handleOwnerOfClick = () => {
    if (tokenId) {
      isOwner();
    } else {
      alert('Please enter a valid token ID');
    }
  };

  const handleListNftClick = () => {
    if (tokenId) {
      listNFT();
    } else {
      alert('Please enter a valid token ID');
    }
  };

  return (
    <div className="App">
      <h1>Marketplace</h1>
      <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect
      </button>
      {connected && (
        <div>
          Connected chain: {chainId && `${chainId}`}<br />
          Connected account: {account && ` ${account}`}<br />
          Contract Balance: {contractBalance}<br />
          Account Balance: {accountBalance} <br />

          <div style={{ padding: 10, margin: 10 }}>
            <input type="number" placeholder="Token Id" onChange={handleTokenIdChange} id="ownerInput" style={{ padding: 10, margin: 10 }} />
            <button style={{ padding: 10, margin: 10 }} onClick={isOwner}>
              Owner
            </button>
            <br />
            <input type="number" placeholder="Token Id" onChange={handleTokenIdChange} id="listInput" style={{ padding: 10, margin: 10 }} />
            <input type="number" placeholder="Price " onChange={handlePriceChange} id="priceInput" style={{ padding: 10, margin: 10 }} />
            <button style={{ padding: 10, margin: 10 }} onClick={listNFT}>
              List for sale
            </button> <br />
            <input type="number" placeholder="Token Id" onChange={handleTokenIdChange} id="buyInput" style={{ padding: 10, margin: 10 }} />
            <button style={{ padding: 10, margin: 10 }} onClick={buyNFT}>
              Buy
            </button>
            <br />
            <input type="number" placeholder="Token Id" onChange={handleTokenIdChange} id="borrowInput" style={{ padding: 10, margin: 10 }} />
            <button style={{ padding: 10, margin: 10 }} onClick={borrowETH}>
              Borrow
            </button> <br />
            <input type="number" placeholder="Token Id" onChange={handleTokenIdChange} id="repayInput" style={{ padding: 10, margin: 10 }} />
            <button style={{ padding: 10, margin: 10 }} onClick={repayLoan}>
              Repay
            </button>
          </div>
        </div>

      )}
    </div>
  );
};

export default App;
