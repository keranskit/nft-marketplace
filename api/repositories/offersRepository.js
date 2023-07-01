'use strict';

const OfferModel = require('../models/offerModel');

class OffersRepository {

    /**
     * @param db
     */
    constructor(db) {
        this.collection = db.collection('offers');
    }

    /**
     * @param {string} collectionAddress
     * @param {string|null|undefined} tokenId
     */
    getAllActiveOffersByCollectionStream(collectionAddress, tokenId = null) {
        const filters = {
            canceled: false,
            closed: false,
            contractAddress: collectionAddress
        }

        if (tokenId) filters.tokenId = tokenId;

        return this.collection.find(filters).stream({transform: doc => OfferModel.fromBSON(doc)});
    }

    /**
     * @param {string} collectionAddress
     */
    getCollectionOffersStream(collectionAddress) {
        const filters = {
            contractAddress: collectionAddress
        }

        return this.collection.find(filters).stream({transform: doc => OfferModel.fromBSON(doc)});
    }
}

module.exports = OffersRepository;
