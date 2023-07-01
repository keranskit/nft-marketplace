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
        await e721.faucet();
        await e721.faucet();
        await e721.faucet();
        await e721.faucet();
        await e721.faucet();
        await e721.connect(addr1).faucet();
    });

    it('Should revert on wrong contract address passed when creating a listing', async function () {
        await expect(nftMarketplace.createListing('0x8584e7a1817c795f74ce985a1d13b962758fe3ca', 10, 1000000000))
            .to.be.revertedWithoutReason();
        await expect(nftMarketplace.createListing(e20.address, 10, 1000000000))
            .to.be.revertedWithoutReason();
    });

    it('Should revert on invalid token ID provided when creating a listing', async function () {
        await expect(nftMarketplace.createListing(e721.address, 10, 1000000000))
            .to.be.revertedWith('ERC721: invalid token ID');
    });

    it('Should revert if marketplace has no allowance when creating a listing', async function () {
        await expect(nftMarketplace.createListing(e721.address, 1, 1000000000))
            .to.be.revertedWith('NFTMarketplace is not allowed to transfer your tokens.');
    });

    it('Should revert if price is zero when creating a listing', async function () {
        await expect(nftMarketplace.createListing(e721.address, 1, 0))
            .to.be.revertedWith('Price in wei should be greater than 0');
    });

    it('Should emit events on listing creation when creating a listing', async function () {
        await e721.setApprovalForAll(nftMarketplace.address, true);

        expect(await nftMarketplace.createListing(e721.address, 1, ethers.utils.parseEther("1")))
            .to.emit(nftMarketplace, "LogListingCreated");
        expect(await nftMarketplace.createListing(e721.address, 2, ethers.utils.parseEther("2")))
            .to.emit(nftMarketplace, "LogListingCreated");
        expect(await nftMarketplace.createListing(e721.address, 3, ethers.utils.parseEther("3")))
            .to.emit(nftMarketplace, "LogListingCreated");
        expect(await nftMarketplace.createListing(e721.address, 4, ethers.utils.parseEther("4")))
            .to.emit(nftMarketplace, "LogListingCreated");
        expect(await nftMarketplace.createListing(e721.address, 5, ethers.utils.parseEther("5")))
            .to.emit(nftMarketplace, "LogListingCreated");
    });

    it('Should revert if not owner of the token when creating a listing', async function () {
        const [owner, addr1] = await ethers.getSigners();
        await expect(nftMarketplace.connect(addr1).createListing(e721.address, 3, 10000000))
            .to.be.revertedWith('You are not the owner of this tokenId');
    });

    it('Should emit event when listing is canceled', async function () {
        expect(await nftMarketplace.cancelListing(1))
            .to.emit(nftMarketplace, "LogListingCanceled");
    });

    it('Should revert when trying to cancel not your own listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).cancelListing(1))
            .to.be.revertedWith('You are not the creator of this listing.');
    });

    it('Should revert when listing is already canceled', async function () {
        await expect(nftMarketplace.cancelListing(1))
            .to.be.revertedWith('Listing is already canceled.');
    });

    it('Should revert if listing is canceled when buying a listing', async function () {
        await expect(nftMarketplace.buyListing(1))
            .to.be.revertedWith('Listing is canceled.');
    });

    it('Should revert if listing is yours when buying a listing', async function () {
        await expect(nftMarketplace.buyListing(2))
            .to.be.revertedWith('You cannot buy your own listing.');
    });

    it('Should revert if tx value is wrong when buying a listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).buyListing(2))
            .to.be.revertedWith('Selling price of the listing is not the same as the value provided');
    });

    it('Should should emit and change ownership event when buying a listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).buyListing(2, {value: ethers.utils.parseEther("3")}))
            .to.emit(nftMarketplace, "LogPurchaseSuccessful");

        expect(await e721.ownerOf(3)).to.equal(addr1.address);
    });

    it('Should revert if trying to buy already sold listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).buyListing(2))
            .to.be.revertedWith('Listing is already sold.');
    });

    it('Should revert if trying to make an offer for already canceled listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).createOffer(1, 10000))
            .to.be.revertedWith('Listing is already canceled.');
    });

    it('Should revert if trying to make an offer for already sold listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).createOffer(2, 10000))
            .to.be.revertedWith('Listing is already sold.');
    });

    it('Should revert if trying to make an offer with zero offered price', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).createOffer(3, 0))
            .to.be.revertedWith('Offered price in wei should be greater than 0');
    });

    it('Should revert if trying to make an offer for your own listing', async function () {
        await expect(nftMarketplace.createOffer(4, 10000000))
            .to.be.revertedWith('You cannot make offer to yourself.');
    });

    it('Should emit event on successful offer creation', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).createOffer(4, 4000000000))
            .to.emit(nftMarketplace, "LogOfferCreated");
        await expect(nftMarketplace.connect(addr1).createOffer(5, 5000000000))
            .to.emit(nftMarketplace, "LogOfferCreated");
        await expect(nftMarketplace.connect(addr1).createOffer(3, 3000000000))
            .to.emit(nftMarketplace, "LogOfferCreated");
        await expect(nftMarketplace.connect(addr1).createOffer(4, 2000000000))
            .to.emit(nftMarketplace, "LogOfferCreated");
        await expect(nftMarketplace.connect(addr1).createOffer(4, 1000000000))
            .to.emit(nftMarketplace, "LogOfferCreated");
    });

    it('Should revert if trying to cancel someone else offer', async function () {
        await expect(nftMarketplace.cancelOffer(4))
            .to.be.revertedWith('You are not the proposer of this offer.');
    });

    it('Should emit event on successful offer cancellation', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).cancelOffer(1))
            .to.emit(nftMarketplace, "LogOfferCanceled");
    });

    it('Should revert if trying to accept canceled offer', async function () {
        await expect(nftMarketplace.acceptOffer(1))
            .to.be.revertedWith('Offer is already canceled');
    });

    it('Should revert if trying to accept someone else offer', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).acceptOffer(2))
            .to.be.revertedWith('You cannot accept offers for someone else\'s listings.');
    });

    it('Should emit event on successful offer acceptation', async function () {
        await expect(nftMarketplace.acceptOffer(2))
            .to.emit(nftMarketplace, "LogOfferAccepted");
    });

    it('Should revert if trying to buy someone else accepted offer', async function () {
        await expect(nftMarketplace.buyListingByAcceptedOffer(2))
            .to.be.revertedWith('Offer is not yours');
    });

    it('Should revert if trying to buy accepted offer without value added', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).buyListingByAcceptedOffer(2))
            .to.be.revertedWith('Offered price is not the same as the value provided');
    });

    it('Should revert if trying to buy non accepted offer', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).buyListingByAcceptedOffer(4))
            .to.be.revertedWith('Offer is not accepted.');
    });

    it('Should revert if trying to buy already sold listing', async function () {
        const [owner, addr1] = await ethers.getSigners();
        await nftMarketplace.connect(addr1).buyListing(4, {value: ethers.utils.parseEther("5")})
        await nftMarketplace.acceptOffer(3)

        await expect(nftMarketplace.connect(addr1).buyListingByAcceptedOffer(3))
            .to.be.revertedWith('Listing is already sold.');
    });

    it('Should revert if trying to buy already canceled listing', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await nftMarketplace.createListing(e721.address, 6, ethers.utils.parseEther("5"));
        await nftMarketplace.connect(addr1).createOffer(5, 1010);
        await nftMarketplace.acceptOffer(5)
        await nftMarketplace.cancelListing(5)

        await expect(nftMarketplace.connect(addr1).buyListingByAcceptedOffer(5))
            .to.be.revertedWith('Listing is canceled.');
    });

    it('Should revert if trying to buy already canceled offer', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await nftMarketplace.createListing(e721.address, 6, ethers.utils.parseEther("5"));
        await nftMarketplace.connect(addr1).createOffer(6, 101010);
        await nftMarketplace.acceptOffer(6)
        await nftMarketplace.connect(addr1).cancelOffer(6)

        await expect(nftMarketplace.connect(addr1).buyListingByAcceptedOffer(6))
            .to.be.revertedWith('Offer is already canceled');
    });

    it('Should emit on successful buying through offer', async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(nftMarketplace.connect(addr1).buyListingByAcceptedOffer(2, {value: 3000000000}))
            .to.emit(nftMarketplace, "LogOfferClosed");
    });
});
