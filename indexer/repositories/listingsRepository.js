'use strict';
const MongoClient = require('mongodb');

class ListingsRepository {

    /**
     * @param {MongoClient.Db} db
     */
    constructor(db) {
        this.collection = db.collection('listings');
    }

    async createListing(data) {
        return this.collection.insertOne(data);
    }

    async markListingAsCanceled(listingId, cancellationTimestamp) {
        const update = {'active': false, 'timestamp': cancellationTimestamp}
        return this.collection.findOneAndUpdate(
            {listingId: listingId},
            {'$set': update}
        );
    }

    async markListingAsBought(listingId, buyer, timestamp) {
        const update = {'active': false, 'buyer': buyer, 'timestamp': timestamp}

        return this.collection.findOneAndUpdate(
            {listingId: listingId},
            {'$set': update}
        );
    }
}

module.exports = ListingsRepository;
