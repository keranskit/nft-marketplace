'use strict';

class OfferModel {

    /**
     * @param {string} offerId
     * @param {string} listingId
     * @param {string} contractAddress
     * @param {string} tokenId
     * @param {string} proposer
     * @param {string} offerPriceInWei
     * @param {number} timestamp
     */
    constructor({offerId, listingId, contractAddress, tokenId, proposer, offerPriceInWei, timestamp}) {
        this.offerId = offerId;
        this.listingId = listingId;
        this.contractAddress = contractAddress;
        this.tokenId = tokenId;
        this.proposer = proposer;
        this.offerPriceInWei = offerPriceInWei;
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
            offerPriceInWei: data['offerPriceInWei'],
            timestamp: data['timestamp'],
        });
    }
}

module.exports = OfferModel;
