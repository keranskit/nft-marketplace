import {ethers} from "hardhat";

export async function main(_privateKey: any) {
    const wallet = new ethers.Wallet(_privateKey, ethers.provider);
    console.log("Deploying contracts with the account:", wallet.address);

    const nftMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await nftMarketplaceFactory.connect(wallet).deploy();
    await nftMarketplace.deployed();
    console.log(`The NFTMarketplace contract is deployed to ${nftMarketplace.address}`);
}
