import {ethers} from "hardhat";

export async function main(_privateKey: any) {
    const wallet = new ethers.Wallet(_privateKey, ethers.provider);
    console.log("Deploying contracts with the account:", wallet.address);

    const nftMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await nftMarketplaceFactory.connect(wallet).deploy();
    await nftMarketplace.deployed();
    console.log(`The NFTMarketplace contract is deployed to ${nftMarketplace.address}`);

    /* todo uncomment to deploy a test ERC721 contract with faucet function */
    // const e271factory = await ethers.getContractFactory('E721');
    // const e721 = await e271factory.connect(wallet).deploy();
    // await e721.deployed();
    // console.log(`The e721 contract is deployed to ${e721.address}`);
}
