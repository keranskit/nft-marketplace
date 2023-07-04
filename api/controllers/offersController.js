'use strict';

class OffersController {

    /**
     * OffersController constructor
     * @param {OffersRepository} offersRepository
     */
    constructor(offersRepository) {
        this.offersRepository = offersRepository;
    }

    /**
     * @param ctx
     * @returns {Promise<void>}
     */
    async getAllActiveOffersByCollection(ctx) {
        const collectionAddress = ctx.params.collection;
        const tokenId = ctx.params.tokenId;

        await new Promise((resolve) => {
            const offers = [];
            const stream = this.offersRepository.getAllActiveOffersByCollectionStream(collectionAddress, tokenId);

            stream.on('data', offer => {
                offers.push(offer);
            });

            stream.on('error', error => {
                console.log(error);

                this._setErrorResponse(ctx, 500, 'unexpected_server_error');
                resolve();
            });

            stream.on('end', () => {
                this._setSuccessResponse(ctx, 200, offers);

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

module.exports = OffersController;
