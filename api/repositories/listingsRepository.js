'use strict';

const ListingModel = require('../models/listingModel');
const { ethers } = require('ethers');

class ListingsRepository {

    /**
     * @param db
     */
    constructor(db) {
        this.collection = db.collection('listings');
    }

    getAllActiveListingsByCollectionStream(collectionAddress) {
        const filters = {
            active: true,
            contractAddress: collectionAddress
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }

    getAllActiveListingsByCreatorStream(seller) {
        const filters = {
            active: true,
            seller: seller
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }

    getCollectionStream(collectionAddress) {
        const filters = {
            contractAddress: collectionAddress
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }

    getPurchaseHistoryByBuyerStream(buyer) {
        const filters = {
            active: false,
            buyer: buyer
        }

        return this.collection.find(filters).stream({transform: doc => ListingModel.fromBSON(doc)});
    }
}

module.exports = ListingsRepository;
