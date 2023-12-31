'use strict';

class ListingModel {

    /**
     * @param {string} listingId
     * @param {string} contractAddress
     * @param {string} tokenId
     * @param {string} seller
     * @param {string} buyer
     * @param {string} priceInWei
     * @param {number} timestamp
     */
    constructor({listingId, contractAddress, tokenId, seller, buyer, priceInWei, timestamp}) {
        this.listingId = listingId;
        this.contractAddress = contractAddress;
        this.tokenId = tokenId;
        this.seller = seller;
        this.buyer = buyer;
        this.priceInWei = priceInWei;
        this.timestamp = timestamp;
    }

    /**
     * @param {Object} data
     * @returns {ListingModel}
     */
    static fromBSON(data) {
        return new this({
            listingId: data['listingId'],
            contractAddress: data['contractAddress'],
            tokenId: data['tokenId'],
            seller: data['seller'],
            buyer: data['buyer'],
            priceInWei: data['priceInWei'],
            timestamp: data['timestamp'],
        });
    }
}

module.exports = ListingModel;
