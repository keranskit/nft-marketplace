'use strict';

const KoaRouter = require('koa-router-find-my-way');

class Router {
    /**
     * @param {Controllers} controllers
     */
    constructor (controllers) {
        this.controllers = controllers.getControllers();
        this.router = KoaRouter();

        this._init();
    }

    /**
     * @returns {Router.Instance}
     */
    getRouter() {
        return this.router;
    };

    /**
     * @private
     */
    _init() {
        this.router.get('/listings-by-collection/:collection', this.controllers.ListingsController.getAllActiveListingsByCollection.bind(this.controllers.ListingsController));
        this.router.get('/listings-by-creator/:address', this.controllers.ListingsController.getAllActiveListingsByCreator.bind(this.controllers.ListingsController));
        this.router.get('/traded-volume/:collection', this.controllers.ListingsController.getCollectionTradedVolume.bind(this.controllers.ListingsController));
        this.router.get('/floor-price/:collection', this.controllers.ListingsController.getCollectionFloorPrice.bind(this.controllers.ListingsController));
        this.router.get('/purchase-history/:address', this.controllers.ListingsController.getPurchaseHistoryByBuyer.bind(this.controllers.ListingsController));
    }
}

module.exports = Router;
