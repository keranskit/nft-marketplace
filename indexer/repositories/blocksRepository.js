'use strict';

const MongoClient = require('mongodb');

class BlocksRepository {

    /**
     * @param {MongoClient.Db} db
     */
    constructor(db) {
        this.collection = db.collection('blocks');
    }

    /**
     * @returns {Promise<*>}
     */
    async getLastProcessedBlock() {
        return this.collection.findOne({}, {sort:{$natural:-1}});
    }

    /**
     * @param {number} lastProcessedBlockNumber
     * @returns {Promise<*>}
     */
    async updateLastProcessedBlock(lastProcessedBlockNumber) {
        return this.collection.replaceOne({}, {blockNumber: lastProcessedBlockNumber}, {upsert: true});
    }
}

module.exports = BlocksRepository;
