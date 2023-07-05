'use strict';

const ethers = require('ethers');
const { BigNumber } = require('ethers');

class ListingsController {

    /**
     * ListingsController constructor
     * @param {ListingsRepository} listingsRepository
     * @param {OffersRepository} offersRepository
     */
    constructor(listingsRepository, offersRepository) {
        this.listingsRepository = listingsRepository;
        this.offersRepository = offersRepository;
    }

    /**
     * @param ctx
     * @returns {Promise<void>}
     */
    async getAllActiveListingsByCollection(ctx) {
        const collectionAddress = ctx.params.collection;

        await new Promise((resolve) => {
            const listings = [];
            const stream = this.listingsRepository.getAllActiveListingsByCollectionStream(collectionAddress);

            stream.on('data', listing => {
                listings.push(listing);
            });

            stream.on('error', error => {
                console.log(error);

                this._setErrorResponse(ctx, 500, 'unexpected_server_error');
                resolve();
            });

            stream.on('end', () => {
                this._setSuccessResponse(ctx, 200, listings);

                resolve();
            });
        });
    }

    /**
     * @param ctx
     * @returns {Promise<void>}
     */
    async getAllActiveListingsByCreator(ctx) {
        const creatorAddress = ctx.params.address;

        await new Promise((resolve) => {
            const listings = [];
            const stream = this.listingsRepository.getAllActiveListingsByCreatorStream(creatorAddress);

            stream.on('data', listing => {
                listings.push(listing);
            });

            stream.on('error', error => {
                console.log(error);

                this._setErrorResponse(ctx, 500, 'unexpected_server_error');
                resolve();
            });

            stream.on('end', () => {
                this._setSuccessResponse(ctx, 200, listings);

                resolve();
            });
        });
    }

    /**
     * @param ctx
     * @returns {Promise<void>}
     */
    async getCollectionData(ctx) {
        const collectionAddress = ctx.params.collection;

        let bestOfferInWei;

        await new Promise((resolve) => {
            const stream = this.offersRepository.getCollectionOffersStream(collectionAddress);

            stream.on('data', offer => {
                const price = ethers.BigNumber.from(offer.priceInWei);

                if (!bestOfferInWei) bestOfferInWei = price;
                if (bestOfferInWei.lt(price)) bestOfferInWei = price;
            });

            stream.on('error', error => {
                console.log(error);
                resolve();
            });

            stream.on('end', () => {
                resolve();
            });
        });

        await new Promise((resolve) => {
            let floorPrice;
            let tradedVolume = BigNumber.from(0);

            const stream = this.listingsRepository.getCollectionStream(collectionAddress);

            stream.on('data', listing => {
                const price = ethers.BigNumber.from(listing.priceInWei)

                if (!floorPrice) floorPrice = price;
                if (floorPrice.gt(price)) floorPrice = price;
                if (listing.buyer !== ethers.constants.AddressZero) tradedVolume = tradedVolume.add(ethers.BigNumber.from(listing.priceInWei))
            });

            stream.on('error', error => {
                console.log(error);

                this._setErrorResponse(ctx, 500, 'unexpected_server_error');
                resolve();
            });

            stream.on('end', () => {
                const res = {
                    collectionFloorPriceInWei: floorPrice.toString(),
                    collectionFloorPriceInEth: ethers.utils.formatUnits(floorPrice),
                    collectionTradedVolumeInWei: tradedVolume.toString(),
                    collectionTradedVolumeInEth: ethers.utils.formatUnits(tradedVolume),
                }
                if (bestOfferInWei) {
                    res.collectionBestOfferInWei = bestOfferInWei.toString();
                    res.collectionBestOfferInEth = ethers.utils.formatUnits(bestOfferInWei);
                }

                this._setSuccessResponse(ctx, 200, res);

                resolve();
            });
        });
    }

    /**
     * @param ctx
     * @returns {Promise<void>}
     */
    async getPurchaseHistoryByBuyer(ctx) {
        const buyerAddress = ctx.params.address;

        await new Promise((resolve) => {
            const listings = [];
            const stream = this.listingsRepository.getPurchaseHistoryByBuyerStream(buyerAddress);

            stream.on('data', listing => {
                listings.push(listing);
            });

            stream.on('error', error => {
                console.log(error);

                this._setErrorResponse(ctx, 500, 'unexpected_server_error');
                resolve();
            });

            stream.on('end', () => {
                this._setSuccessResponse(ctx, 200, listings);

                resolve();
            });
        });
    }

    _setSuccessResponse(ctx, responseCode, response) {
        ctx.status = responseCode;
        ctx.type = 'application/json';
        ctx.body = response;
    }

    _setErrorResponse(ctx, errorCode, error) {
        ctx.status = errorCode;
        ctx.type = 'application/json';
        ctx.body = { error };
    }
}

module.exports = ListingsController;
