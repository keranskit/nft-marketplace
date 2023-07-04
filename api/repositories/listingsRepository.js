'use strict';

const ListingModel = require('../models/listingModel');

class ListingsRepository {

    /**
     * @param db
     */
    constructor(db) {
        this.collection = db.collection('listings');
    }

    /**
     * @param {string} collectionAddress
     */
    getAllActiveListingsByCollectionStream(collectionAddress) {
        const filters = {
            active: true,
            contractAddress: collectionAddress
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }

    /**
     * @param {string} seller
     */
    getAllActiveListingsByCreatorStream(seller) {
        const filters = {
            active: true,
            seller: seller
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }

    /**
     * @param {string} collectionAddress
     */
    getCollectionStream(collectionAddress) {
        const filters = {
            contractAddress: collectionAddress
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }

    /**
     * @param {string} buyer
     */
    getPurchaseHistoryByBuyerStream(buyer) {
        const filters = {
            active: false,
            buyer: buyer
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }
}

module.exports = ListingsRepository;
