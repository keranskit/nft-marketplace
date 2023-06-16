// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplace {
    using Counters for Counters.Counter;
    Counters.Counter private _listingsIds;
//    Counters.Counter private _offersIds;

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

//    struct Offer {
//        uint offerId;
//        uint listingId;
//        address proposer;
//        uint offeredPriceInWei;
//        uint32 timestamp;
//        bool canceled;
//    }

    mapping (uint => Listing) private listings;
//    mapping (uint => Offer) private offers;

    event LogListingCreated(uint listingId, address contractAddress, uint tokenId, address seller, uint priceInWei);
    event LogPurchaseSuccessful(uint listingId, address buyer);
    event LogListingCanceled(uint listingId);
//    event LogOfferCreated(uint offerId, uint listingId, address proposer, uint offerPriceInWei);
//    event LogOfferAccepted(uint offerId);
//    event LogOfferCanceled(uint offerId);

    function createListing(address contractAddress, uint tokenId, uint priceInWei) public {
        require(isERC721(contractAddress), "Provided contract is not of type ERC721.");

        IERC721 contractInstance = IERC721(contractAddress);

        require(contractInstance.ownerOf(tokenId) == msg.sender, "You are not the owner of this tokenId");
        require(contractInstance.isApprovedForAll(msg.sender, address(this)), "NFTMarketplace is not allowed to transfer your tokens.");

        uint newListingId = _listingsIds.current();
        _listingsIds.increment();

        Listing memory newListing = Listing(newListingId, contractAddress, tokenId, msg.sender, address(0), priceInWei, uint32(block.timestamp), false);
        listings[newListingId] = newListing;

        emit LogListingCreated(newListingId, contractAddress, tokenId, msg.sender, priceInWei);
    }

    function buyListing(uint listingId) public payable {
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
        listings[listingId].canceled = true;

        emit LogListingCanceled(listingId);
    }

//    function createOffer() public {
//    }
//
//    function acceptOffer() public {
//
//    }
//
//    function cancelOffer() public {
//
//    }

    function isERC721(address contractAddress) private view returns (bool) {
        require(isContract(contractAddress), "Provided address is not a contract.");

        return IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId);
    }

    function isContract(address contractAddress) private view returns (bool) {
        uint size;
        assembly { size := extcodesize(contractAddress) }
        return size > 0;
    }
}
