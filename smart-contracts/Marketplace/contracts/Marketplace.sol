// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace {
    struct Listing {
        address payable seller;
        uint256 price;
        bool active;
    }
    struct Loan {
        address borrower;
        uint256 tokenId;
        uint256 amount;
        bool active;
    }
    mapping(uint256 => Listing) public listings;
    mapping(address => mapping(uint256 => Loan)) public loans;
    IERC721 public nftContract;
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event NFTSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );
    event ETHBorrowed(
        uint256 indexed tokenId,
        address indexed borrower,
        uint256 amount
    );
    event LoanRepaid(
        uint256 indexed tokenId,
        address indexed borrower,
        uint256 amount
    );

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You don't own this NFT"
        );
        require(!listings[tokenId].active, "NFT already listed for sale");
        listings[tokenId] = Listing({
            seller: payable(msg.sender),
            price: price,
            active: true
        });
        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFT not listed for sale");
        require(msg.value >= listing.price, "Insufficient funds");
        uint256 price = listing.price;
        listing.active = false;
        nftContract.transferFrom(listing.seller, msg.sender, tokenId);
        payable(listing.seller).transfer(listing.price);
        emit NFTSold(tokenId, msg.sender, price);
    }

    function borrow(uint256 tokenId) external payable {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You don't own this NFT"
        );

        Listing memory listing = listings[tokenId];

        require(
            listing.price != 0 && !listing.active,
            "NFT not listed for sufficient price"
        );

        require(
            !loans[msg.sender][tokenId].active,
            "You already borrowed against this NFT"
        );

        loans[msg.sender][tokenId] = Loan({
            borrower: msg.sender,
            tokenId: tokenId,
            amount: listing.price,
            active: true
        });

        payable(msg.sender).transfer(listing.price);

        emit ETHBorrowed(tokenId, msg.sender, msg.value);
    }

    function repayLoan(uint256 tokenId) external payable {
        Loan memory loan = loans[msg.sender][tokenId];
        require(loan.active, "No active loan found");
        require(msg.value >= loan.amount, "Incorrect amount sent");
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        delete loans[msg.sender][tokenId];
        emit LoanRepaid(tokenId, msg.sender, msg.value);
    }

    function receiveEth() external payable {}

    receive() external payable {}
}
