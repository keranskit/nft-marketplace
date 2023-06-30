'use strict';

const {ethers} = require("ethers");
const eventNames = require('../constants/eventNames')

class IndexerService {

    /**
     * @param {BlocksRepository} blocksRepository
     * @param {ListingsRepository} listingsRepository
     * @param {OffersRepository} offersRepository
     * @param {string} network
     * @param {string} contractAddress
     * @param {Object[]} contractABI
     */
    constructor({blocksRepository, listingsRepository, offersRepository, network, contractAddress, contractABI}) {
        this.blocksRepository = blocksRepository;
        this.listingsRepository = listingsRepository;
        this.offersRepository = offersRepository;
        this.provider = new ethers.providers.InfuraProvider(network, process.env['INFURA_SEPOLIA_API_KEY']);
        this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
    }

    async startIndexer() {
        const lastProcessedBlock = await this.blocksRepository.getLastProcessedBlock();
        const networkLastBlock = await this.provider.getBlockNumber();

        if (!lastProcessedBlock) {
            await this.processContractOldEvents(networkLastBlock);
        } else if (lastProcessedBlock.blockNumber < networkLastBlock) {
            await this.processContractOldEvents(networkLastBlock, lastProcessedBlock.blockNumber);
        } else {
            await this.startListeningForNewEvents();
        }
    }

    async processContractOldEvents(networkLastBlock, fromBlockNumber = undefined) {
        console.log('Processing old events...')

        const contractEvents = await this.contract.queryFilter('*', fromBlockNumber);
        for (const event of contractEvents) {
            await this.processEvent(event);
        }

        await this.blocksRepository.updateLastProcessedBlock(networkLastBlock);

        await this.startIndexer();
    }

    async startListeningForNewEvents() {
        console.log('Live listening for new contract events started')

        this.contract.on(eventNames.LISTING_CREATED, async (listingId, contractAddress, tokenId, seller, priceInWei, event) => {
            try {
                const blockData = await event.getBlock();
                await this.processListingCreated(event.args, blockData);

                await this.blocksRepository.updateLastProcessedBlock(blockData.number);
            } catch (e) {
                console.log(e)
            }
        })

        this.contract.on(eventNames.LISTING_CANCELED, async (listingId, event) => {
            try {
                const blockData = await event.getBlock();
                await this.processListingCanceled(event.args, blockData);

                await this.blocksRepository.updateLastProcessedBlock(blockData.number);
            } catch (e) {
                console.log(e)
            }
        })

        this.contract.on(eventNames.PURCHASE_SUCCESSFUL, async (listingId, buyer, event) => {
            try {
                const blockData = await event.getBlock();
                await this.processPurchaseSuccessful(event.args, blockData);

                await this.blocksRepository.updateLastProcessedBlock(blockData.number);
            } catch (e) {
                console.log(e)
            }
        })

        this.contract.on(eventNames.OFFER_CREATED, async (offerId, listingId, proposer, offerPriceInWei, event) => {
            try {
                const blockData = await event.getBlock();
                await this.processOfferCreated(event.args, blockData);

                await this.blocksRepository.updateLastProcessedBlock(blockData.number);
            } catch (e) {
                console.log(e)
            }
        })

        this.contract.on(eventNames.OFFER_ACCEPTED, async (offerId, event) => {
            try {
                const blockData = await event.getBlock();
                await this.processOfferAccepted(event.args, blockData);

                await this.blocksRepository.updateLastProcessedBlock(blockData.number);
            } catch (e) {
                console.log(e)
            }
        })

        this.contract.on(eventNames.OFFER_CANCELED, async (offerId, event) => {
            try {
                const blockData = await event.getBlock();
                await this.processOfferCanceled(event.args, blockData);

                await this.blocksRepository.updateLastProcessedBlock(blockData.number);
            } catch (e) {
                console.log(e)
            }
        })
    }

    async processEvent(event) {
        const blockData = await event.getBlock();

        switch (event.event) {
            case eventNames.LISTING_CREATED: await this.processListingCreated(event.args, blockData);
                break;
            case eventNames.LISTING_CANCELED: await this.processListingCanceled(event.args, blockData);
                break;
            case eventNames.PURCHASE_SUCCESSFUL: await this.processPurchaseSuccessful(event.args, blockData);
                break;
            case eventNames.OFFER_CREATED: await this.processOfferCreated(event.args, blockData);
                break;
            case eventNames.OFFER_CANCELED: await this.processOfferCanceled(event.args, blockData);
                break;
            case eventNames.OFFER_ACCEPTED: await this.processOfferAccepted(event.args, blockData);
                break;
            default:
                console.log('Unknown event');
                break;
        }
    }

    async processListingCreated(eventArgs, blockData) {
        const data = {
            listingId: eventArgs.listingId.toString(),
            contractAddress: eventArgs.contractAddress,
            tokenId: eventArgs.tokenId.toString(),
            seller: eventArgs.seller,
            buyer: ethers.constants.AddressZero,
            priceInWei: eventArgs.priceInWei.toString(),
            timestamp: blockData.timestamp,
            active: true
        };

        console.log(`Indexer: processing listing created with id ${data.listingId}`);

        await this.listingsRepository.createListing(data);
    }

    async processListingCanceled(eventArgs, blockData) {
        console.log(`Indexer: processing cancel listing with id ${eventArgs.listingId.toString()}`);

        await this.listingsRepository.markListingAsCanceled(eventArgs.listingId.toString(), blockData.timestamp);
    }

    async processPurchaseSuccessful(eventArgs, blockData) {
        console.log(`Indexer: processing purchase successful with id ${eventArgs.listingId.toString()}`);

        await this.listingsRepository.markListingAsBought(eventArgs.listingId.toString(), eventArgs.buyer, blockData.timestamp);
    }

    async processOfferCreated(eventArgs, blockData) {
        const data = {
            offerId: eventArgs.offerId.toString(),
            listingId: eventArgs.listingId.toString(),
            proposer: eventArgs.proposer.toString(),
            offerPriceInWei: eventArgs.offerPriceInWei.toString(),
            timestamp: blockData.timestamp,
            canceled: false,
            accepted: false,
            completed: false
        }

        console.log(`Indexer: processing offer created with id ${eventArgs.offerId.toString()}`);

        await this.offersRepository.createOffer(data);
    }

    async processOfferAccepted(eventArgs, blockData) {
        console.log(`Indexer: processing offer accepted with id ${eventArgs.offerId.toString()}`);

        await this.offersRepository.markOfferAsAccepted(eventArgs.offerId.toString(), blockData.timestamp);
    }

    async processOfferCanceled(eventArgs, blockData) {
        console.log(`Indexer: processing offer canceled with id ${eventArgs.offerId.toString()}`);

        await this.offersRepository.markOfferAsCanceled(eventArgs.offerId.toString(), blockData.timestamp);
    }
}

module.exports = IndexerService;
