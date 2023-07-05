// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

///@title A marketplace for ERC721 NFT
///@author Trayan Keranov
contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _listingsIds;
    Counters.Counter private _offersIds;

    struct Listing {
        uint256 listingId;
        address contractAddress;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 priceInWei;
        uint32 timestamp;
        bool canceled;
    }

    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address proposer;
        uint256 priceInWei;
        uint32 timestamp;
        bool canceled;
        bool acceptedBySeller;
        bool closed;
    }

    mapping (uint256 => Listing) private listings;
    mapping (uint256 => Offer) private offers;

    event LogListingCreated(uint256 listingId, address contractAddress, uint256 tokenId, address seller, uint256 priceInWei);
    event LogPurchaseSuccessful(uint256 listingId, address buyer);
    event LogListingCanceled(uint256 listingId);
    event LogOfferCreated(uint256 offerId, uint256 listingId, address contractAddress, uint256 tokenId ,address proposer, uint256 priceInWei);
    event LogOfferAccepted(uint256 offerId);
    event LogOfferCanceled(uint256 offerId);
    event LogOfferClosed(uint256 offerId, uint256 listingId, address buyer, uint256 soldForWei);

    ///@notice Creates a listing in the marketplace
    ///@dev The marketplace should be allowed to transfer tokens (setApprovalForAll)
    ///@param contractAddress The ERC721 contract address
    ///@param tokenId The Id of the token
    ///@param priceInWei The price that the creator wants for the token (in WEI)
    function createListing(address contractAddress, uint256 tokenId, uint256 priceInWei) public isERC721(contractAddress) {
        IERC721 contractInstance = IERC721(contractAddress);

        require(priceInWei > 0, "Price in wei should be greater than 0");
        require(contractInstance.ownerOf(tokenId) == msg.sender, "You are not the owner of this tokenId");
        require(contractInstance.isApprovedForAll(msg.sender, address(this)), "NFTMarketplace is not allowed to transfer your tokens.");

        uint256 newListingId = _listingsIds.current();
        _listingsIds.increment();

        Listing memory newListing = Listing(newListingId, contractAddress, tokenId, msg.sender, address(0), priceInWei, uint32(block.timestamp), false);
        listings[newListingId] = newListing;

        emit LogListingCreated(newListingId, contractAddress, tokenId, msg.sender, priceInWei);
    }

    ///@notice Buys a listing from the marketplace
    ///@dev The marketplace transfers the token to the buyer and moves the sent ethers to the creator of the listing
    ///@param listingId The ID of the listing that the user wants to buy
    function buyListing(uint256 listingId) public payable nonReentrant {
        require(listings[listingId].canceled == false, "Listing is canceled.");
        require(listings[listingId].seller != msg.sender, "You cannot buy your own listing.");
        require(listings[listingId].buyer == address(0), "Listing is already sold.");
        require(listings[listingId].priceInWei == msg.value, "Selling price of the listing is not the same as the value provided");

        Listing storage listing = listings[listingId];

        listing.buyer = msg.sender;

        IERC721 contractInstance = IERC721(listing.contractAddress);

        contractInstance.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        payable(listing.seller).transfer(msg.value);

        emit LogPurchaseSuccessful(listingId, msg.sender);
    }

    ///@notice Function that cancels a listing
    ///@param listingId The ID of the listing that the user wants to cancel
    function cancelListing(uint256 listingId) public {
        require(listings[listingId].seller == msg.sender, "You are not the creator of this listing.");
        require(listings[listingId].canceled == false, "Listing is already canceled.");
        listings[listingId].canceled = true;

        emit LogListingCanceled(listingId);
    }

    ///@notice Creates an offer for existing listing in the marketplace
    ///@param listingId The ID of the listing that the user wants to make offer for
    ///@param priceInWei The price that the user wants to offer (in WEI)
    function createOffer(uint256 listingId, uint256 priceInWei) public {
        Listing memory listing = listings[listingId];

        require(listing.canceled == false, "Listing is already canceled.");
        require(listing.buyer == address(0), "Listing is already sold.");
        require(priceInWei > 0, "Offered price in wei should be greater than 0");
        require(listing.seller != msg.sender, "You cannot make offer to yourself.");

        uint256 newOfferId = _offersIds.current();
        _offersIds.increment();

        Offer memory newOffer = Offer(newOfferId, listingId, msg.sender, priceInWei, uint32(block.timestamp), false, false, false);
        offers[newOfferId] = newOffer;

        emit LogOfferCreated(newOfferId, listingId, listing.contractAddress, listing.tokenId, msg.sender, priceInWei);
    }

    ///@notice Accepts existing offer for specific listing in the marketplace
    ///@dev Only the creator of the listing can accept an offer
    ///@param offerId The ID of the offer that the user wants accept
    function acceptOffer(uint256 offerId) public {
        require(offers[offerId].canceled == false, "Offer is already canceled");
        require(listings[offers[offerId].listingId].seller == msg.sender, "You cannot accept offers for someone else's listings.");

        Offer storage offer = offers[offerId];
        offer.acceptedBySeller = true;

        emit LogOfferAccepted(offerId);
    }

    ///@notice Cancels existing offer for specific listing in the marketplace
    ///@dev Only the creator of the offer can cancel the offer
    ///@param offerId The ID of the offer that the user wants to cancel
    function cancelOffer(uint256 offerId) public {
        require(offers[offerId].proposer == msg.sender ,"You are not the proposer of this offer.");

        Offer storage offer = offers[offerId];
        offer.canceled = true;

        emit LogOfferCanceled(offerId);
    }

    ///@notice Complete an existing deal (when the creator of the listing accepts an offer)
    ///@dev When the offer is accepted by the listing creator, the offer creator should call this function to complete the transfer
    ///@param offerId The ID of the offer that the user wants to complete
    function buyListingByAcceptedOffer(uint256 offerId) public payable nonReentrant {
        Offer storage offer = offers[offerId];
        Listing storage listing = listings[offer.listingId];

        require(listing.canceled == false, "Listing is canceled.");
        require(listing.buyer == address(0), "Listing is already sold.");
        require(offer.acceptedBySeller == true, "Offer is not accepted.");
        require(offer.proposer == msg.sender, "Offer is not yours");
        require(offer.canceled == false, "Offer is already canceled");
        require(offer.priceInWei == msg.value, "Offered price is not the same as the value provided");

        IERC721 contractInstance = IERC721(listing.contractAddress);

        contractInstance.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        payable(listing.seller).transfer(msg.value);

        listing.buyer = msg.sender;
        listing.priceInWei = offer.priceInWei;

        offer.closed = true;

        emit LogOfferClosed(offerId, offer.listingId, msg.sender, offer.priceInWei);
    }

    ///@notice Checks if a contractAddress supports ERC721 interface
    ///@param contractAddress The address to check
    modifier isERC721(address contractAddress) {
        require(IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId), "Provided address is not an ERC721 contract.");
        _;
    }
}
