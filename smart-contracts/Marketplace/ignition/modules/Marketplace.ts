import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require("dotenv").config();

const { NFT_CONTRACT_ADDRESS } = process.env;

if (!NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT_CONTRACT_ADDRESS is not defined in the environment variables.");
}

export default buildModule("Marketplace", (m) => {
    const nftMarketplace = m.contract("Marketplace", [NFT_CONTRACT_ADDRESS.toString()]);

    return { nftMarketplace };
});
