const { MongoClient } = require('mongodb');
const {ethers} = require('ethers');
const nftMarketplaceJson = require('../contracts/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json')
const BlocksRepository = require("./repositories/blocksRepository");
const ListingsRepository = require("./repositories/listingsRepository");
const OffersRepository = require("./repositories/offersRepository");
const IndexerService = require("./services/indexerService");
const { config } = require('dotenv');
config();

async function start() {

    /** Init db connection **/
    const mongoDb = new MongoClient(
        process.env.MONGO_URI,
        Object.assign({
            useNewUrlParser: true,
            useUnifiedTopology: true,
            appname: 'nft-marketplace'
        })
    );

    await mongoDb.connect()
        .catch(e => {
            console.log(`MongoDB connection error: ${e}`);
            process.exit(1);
        });

    const db = mongoDb.db(process.env.MONGO_DB);

    const blocksRepository = new BlocksRepository(db);
    const listingsRepository = new ListingsRepository(db);
    const offersRepository = new OffersRepository(db);

    const network = process.env.NETWORK;
    const contractAddress = process.env.SEPOLIA_CONTRACT_ADDRESS;
    const contractCreationBlockNumber = Number(process.env.CONTRACT_CREATION_BLOCK_NUMBER);

    const indexerService = new IndexerService({
        blocksRepository: blocksRepository,
        listingsRepository: listingsRepository,
        offersRepository: offersRepository,
        network: network,
        contractAddress: contractAddress,
        contractABI: nftMarketplaceJson.abi,
        contractCreationBlockNumber: contractCreationBlockNumber
    });

    await indexerService.startIndexer();
}

start().catch(console.error);

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason, ' Unhandled Rejection at Promise ', promise);
    setTimeout(() => process.exit(1), 1);
}).on('uncaughtException', error => {
    console.log(error + ' Uncaught Exception thrown');
    setTimeout(() => process.exit(1), 1);
});
