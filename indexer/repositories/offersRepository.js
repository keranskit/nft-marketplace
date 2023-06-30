'use strict';

const MongoClient = require('mongodb');

class OffersRepository {

    /**
     * @param {MongoClient.Db} db
     */
    constructor(db) {
        this.collection = db.collection('offers');
    }

    async createOffer(data) {
        return this.collection.insertOne(data);
    }

    async markOfferAsCanceled(offerId, timestamp) {
        const update = {'canceled': true, 'timestamp': timestamp}
        return this.collection.findOneAndUpdate(
            {offerId: offerId},
            {'$set': update}
        );
    }

    async markOfferAsAccepted(offerId, timestamp) {
        const update = {'acceptedBySeller': true, 'timestamp': timestamp}
        return this.collection.findOneAndUpdate(
            {offerId: offerId},
            {'$set': update}
        );
    }
}

module.exports = OffersRepository;
