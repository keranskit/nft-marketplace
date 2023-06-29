'use strict';

const {ethers} = require("ethers");
const eventNames = require('../constants/eventNames')

class IndexerService {

    /**
     * @param {BlocksRepository} blocksRepository
     * @param {ListingsRepository} listingsRepository
     * @param {string} network
     * @param {string} contractAddress
     * @param {Object[]} contractABI
     */
    constructor({blocksRepository, listingsRepository, network, contractAddress, contractABI}) {
        this.blocksRepository = blocksRepository;
        this.listingsRepository = listingsRepository;
        this.provider = new ethers.providers.InfuraProvider(network, process.env['INFURA_SEPOLIA_API_KEY']);
        this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
    }

    //todo add some logs and some debugging

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
            default:
                console.log('Unknown event');
                break;
        }
    }

    async processListingCreated(eventArgs, blockData) {
        const data = {};

        data.listingId = eventArgs.listingId.toString();
        data.contractAddress = eventArgs.contractAddress;
        data.tokenId = eventArgs.tokenId.toString();
        data.seller = eventArgs.seller;
        data.buyer = ethers.constants.AddressZero;
        data.priceInWei = eventArgs.priceInWei.toString();
        data.timestamp = blockData.timestamp;
        data.active = true;

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
}

module.exports = IndexerService;
