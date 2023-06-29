'use strict';

const ListingsController = require('./listingsController');

class Controllers {

    /**
     * @param {Object} repositories
     * @param {ListingsRepository} repositories.listings
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
            ListingsController: new ListingsController(this.repositories.listings),
        }
    }
}

module.exports = Controllers;
