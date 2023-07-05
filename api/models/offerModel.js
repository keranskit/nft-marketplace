'use strict';

class OfferModel {

    /**
     * @param {string} offerId
     * @param {string} listingId
     * @param {string} contractAddress
     * @param {string} tokenId
     * @param {string} proposer
     * @param {string} priceInWei
     * @param {number} timestamp
     */
    constructor({offerId, listingId, contractAddress, tokenId, proposer, priceInWei, timestamp}) {
        this.offerId = offerId;
        this.listingId = listingId;
        this.contractAddress = contractAddress;
        this.tokenId = tokenId;
        this.proposer = proposer;
        this.priceInWei = priceInWei;
        this.timestamp = timestamp;
    }

    /**
     * @param {Object} data
     * @returns {OfferModel}
     */
    static fromBSON(data) {
        return new this({
            offerId: data['offerId'],
            listingId: data['listingId'],
            contractAddress: data['contractAddress'],
            tokenId: data['tokenId'],
            proposer: data['proposer'],
            priceInWei: data['priceInWei'],
            timestamp: data['timestamp'],
        });
    }
}

module.exports = OfferModel;
