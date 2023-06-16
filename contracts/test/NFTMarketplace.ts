import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTMarketplace, E721, E20 } from "../typechain-types"

describe("NFTMarketplace", function () {
    let nftMarketplaceFactory;
    let nftMarketplace: NFTMarketplace;
    let e721factory;
    let e721: E721;
    let e20factory;
    let e20: E20;

    before(async () => {
        const [owner, addr1] = await ethers.getSigners();
        nftMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
        nftMarketplace = await nftMarketplaceFactory.deploy();

        await nftMarketplace.deployed();

        e721factory = await ethers.getContractFactory("E721");
        e721 = await e721factory.deploy();

        await e721.deployed();

        e20factory = await ethers.getContractFactory("E20");
        e20 = await e20factory.deploy();

        await e20.deployed();

        await e721.faucet();
        await e721.faucet();
        await e721.faucet();
        await e721.connect(addr1).faucet();
    });

    it('Should test whole create listing functionality', async function () {
        await expect(nftMarketplace.createListing('0x8584e7a1817c795f74ce985a1d13b962758fe3ca', 10, 1000000000))
            .to.be.revertedWith('Provided address is not a contract.');
        await expect(nftMarketplace.createListing(e20.address, 10, 1000000000))
            .to.be.revertedWithoutReason();
        await expect(nftMarketplace.createListing(e721.address, 10, 1000000000))
            .to.be.revertedWith('ERC721: invalid token ID');
        await expect(nftMarketplace.createListing(e721.address, 1, 1000000000))
            .to.be.revertedWith('NFTMarketplace is not allowed to transfer your tokens.');

        await e721.setApprovalForAll(nftMarketplace.address, true);

        expect(await nftMarketplace.createListing(e721.address, 1, ethers.utils.parseEther("1")))
            .to.emit(nftMarketplace, "LogListingCreated");
        expect(await nftMarketplace.createListing(e721.address, 2, ethers.utils.parseEther("2")))
            .to.emit(nftMarketplace, "LogListingCreated");
        expect(await nftMarketplace.createListing(e721.address, 3, ethers.utils.parseEther("3")))
            .to.emit(nftMarketplace, "LogListingCreated");

        const [owner, addr1] = await ethers.getSigners();
        await expect(nftMarketplace.connect(addr1).createListing(e721.address, 3, 10000000))
            .to.be.revertedWith('You are not the owner of this tokenId');
    });

    it('Should test the cancel listing functionality', async function () {
        const [owner, addr1] = await ethers.getSigners();

        expect(await nftMarketplace.cancelListing(1))
            .to.emit(nftMarketplace, "LogListingCanceled");
        await expect(nftMarketplace.connect(addr1).cancelListing(1))
            .to.be.revertedWith('You are not the creator of this listing.');
    });

    it('Should test the buy listing functionality', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.buyListing(1))
            .to.be.revertedWith('Listing is canceled.');
        await expect(nftMarketplace.buyListing(2))
            .to.be.revertedWith('You cannot buy your own listing.');
        await expect(nftMarketplace.connect(addr1).buyListing(2))
            .to.be.revertedWith('Selling price of the listing is not the same as the value provided');

        await expect(nftMarketplace.connect(addr1).buyListing(2, {value: ethers.utils.parseEther("3")}))
            .to.emit(nftMarketplace, "LogPurchaseSuccessful");

        expect(await e721.ownerOf(3)).to.equal(addr1.address);
        await expect(nftMarketplace.connect(addr1).buyListing(2))
            .to.be.revertedWith('Listing is already sold.');
    });
});
