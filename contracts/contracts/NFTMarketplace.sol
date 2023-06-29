// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _listingsIds;
    Counters.Counter private _offersIds;

    struct Listing {
        uint listingId;
        address contractAddress;
        uint tokenId;
        address seller;
        address buyer;
        uint priceInWei;
        uint32 timestamp;
        bool canceled;
    }

    struct Offer {
        uint offerId;
        uint listingId;
        address proposer;
        uint offeredPriceInWei;
        uint32 timestamp;
        bool canceled;
        bool acceptedBySeller;
        bool completed;
    }

    mapping (uint => Listing) private listings;
    mapping (uint => Offer) private offers;

    event LogListingCreated(uint listingId, address contractAddress, uint tokenId, address seller, uint priceInWei);
    event LogPurchaseSuccessful(uint listingId, address buyer);
    event LogListingCanceled(uint listingId);
    event LogOfferCreated(uint offerId, uint listingId, address proposer, uint offerPriceInWei);
    event LogOfferAccepted(uint offerId);
    event LogOfferCanceled(uint offerId);

    function createListing(address contractAddress, uint tokenId, uint priceInWei) public isERC721(contractAddress) {
        IERC721 contractInstance = IERC721(contractAddress);

        require(priceInWei > 0, "Price in wei should be greater than 0");
        require(contractInstance.ownerOf(tokenId) == msg.sender, "You are not the owner of this tokenId");
        require(contractInstance.isApprovedForAll(msg.sender, address(this)), "NFTMarketplace is not allowed to transfer your tokens.");

        uint newListingId = _listingsIds.current();
        _listingsIds.increment();

        Listing memory newListing = Listing(newListingId, contractAddress, tokenId, msg.sender, address(0), priceInWei, uint32(block.timestamp), false);
        listings[newListingId] = newListing;

        emit LogListingCreated(newListingId, contractAddress, tokenId, msg.sender, priceInWei);
    }

    function buyListing(uint listingId) public payable nonReentrant {
        require(listings[listingId].canceled == false, "Listing is canceled.");
        require(listings[listingId].seller != msg.sender, "You cannot buy your own listing.");
        require(listings[listingId].buyer == address(0), "Listing is already sold.");
        require(listings[listingId].priceInWei == msg.value, "Selling price of the listing is not the same as the value provided");

        Listing storage listing = listings[listingId];

        IERC721 contractInstance = IERC721(listing.contractAddress);

        contractInstance.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        payable(listing.seller).transfer(msg.value);

        listing.buyer = msg.sender;

        emit LogPurchaseSuccessful(listingId, msg.sender);
    }

    function cancelListing(uint listingId) public {
        require(listings[listingId].seller == msg.sender, "You are not the creator of this listing.");
        require(listings[listingId].canceled == false, "Listing is already canceled.");
        listings[listingId].canceled = true;

        emit LogListingCanceled(listingId);
    }

    function createOffer(uint listingId, uint offeredPriceInWei) public {
        require(listings[listingId].canceled == false, "Listing is already canceled.");
        require(listings[listingId].buyer == address(0), "Listing is already sold.");
        require(offeredPriceInWei > 0, "Offered price in wei should be greater than 0");
        require(listings[listingId].seller != msg.sender, "You cannot make offer to yourself.");

        uint newOfferId = _offersIds.current();
        _offersIds.increment();

        Offer memory newOffer = Offer(newOfferId, listingId, msg.sender, offeredPriceInWei, uint32(block.timestamp), false, false, false);
        offers[newOfferId] = newOffer;

        emit LogOfferCreated(newOfferId, listingId, msg.sender, offeredPriceInWei);
    }

    function acceptOffer(uint offerId) public {
        require(listings[offers[offerId].listingId].seller == msg.sender, "You cannot accept offers for someone else's listings.");

        Offer storage offer = offers[offerId];
        offer.acceptedBySeller = true;

        emit LogOfferAccepted(offerId);
    }

    function cancelOffer(uint offerId) public {
        require(offers[offerId].proposer == msg.sender ,"You are not the proposer of this offer.");

        Offer storage offer = offers[offerId];
        offer.canceled = true;

        emit LogOfferCanceled(offerId);
    }

    function buyListingByAcceptedOffer(uint offerId) public payable {
        uint listingId = offers[offerId].listingId;

        require(listings[listingId].canceled == false, "Listing is canceled.");
        require(listings[listingId].buyer == address(0), "Listing is already sold.");
        require(offers[offerId].acceptedBySeller == true, "Offer is not accepted.");
        require(offers[offerId].proposer == msg.sender, "Offer is not yours");
        require(offers[offerId].canceled == false, "Offer is already canceled");
        require(offers[offerId].offeredPriceInWei == msg.value, "Offered price is not the same as the value provided");

        Listing storage listing = listings[listingId];

        IERC721 contractInstance = IERC721(listing.contractAddress);

        contractInstance.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        payable(listing.seller).transfer(msg.value);

        listing.buyer = msg.sender;

        Offer storage offer = offers[offerId];
        offer.completed = true;

        emit LogPurchaseSuccessful(listingId, msg.sender);
    }

    modifier isERC721(address contractAddress) {
        require(IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId), "Provided address is not an ERC721 contract.");
        _;
    }
}
