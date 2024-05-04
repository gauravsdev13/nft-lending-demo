import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC721", (m) => {
    const myNFT = m.contract("MyNFT");

    return { myNFT };
});