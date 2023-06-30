'use strict';

const ListingsController = require('./listingsController');
const OffersController = require('./offersController');

class Controllers {

    /**
     * @param {Object} repositories
     * @param {ListingsRepository} repositories.listings
     * @param {OffersRepository} repositories.offers
     */
    constructor(repositories) {
        this.repositories = repositories;
        this.controllers = this._initControllers();
    };

    /**
     * @return {Object}
     */
    getControllers() {
        return this.controllers;
    }

    /**
     * @returns {object}
     * @private
     */
    _initControllers() {
        return {
            ListingsController: new ListingsController(this.repositories.listings, this.repositories.offers),
            OffersController: new OffersController(this.repositories.offers),
        }
    }
}

module.exports = Controllers;
