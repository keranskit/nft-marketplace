# nft-marketplace

NFT Marketplace deployed on sepolia https://sepolia.etherscan.io/address/0xDe24B40eeE53ab476914080C5Bf589fD5bc2bD94

ERC721 contract with faucet function deployed to https://sepolia.etherscan.io/address/0xF5D436624037F5A81e5b6ae906f54aD3c0259442



Custom scripts examples

`npx hardhat approve-all --network sepolia --private-key [privateKey] --address [addressToBeApproved]`

`npx hardhat faucet --network sepolia --private-key [privateKey]`

CLI Commands

`npm run start-cli sepolia create-listing [ERC721address] [tokenId] [priceInWei]`

`npm run start-cli sepolia buy-listing [listingId] [listingPrice]`

`npm run start-cli sepolia cancel-listing [listingId]`

`npm run start-cli sepolia create-offer [listingId] [offerPriceInWei]`

`npm run start-cli sepolia accept-offer [offerId]`

`npm run start-cli sepolia cancel-offer [offerId]`

`npm run start-cli sepolia buy-listing-by-offer [offerId] [offerPriceInWei]`

To start the indexer run 

`npm run start-indexer`

To start the API server run

`npm run start-api-server`

API Endpoints examples (postman collection)

`https://api.postman.com/collections/25529776-1a5ede73-672c-4605-bc3d-086ab4267135?access_key=PMAT-01H4RD0ZNHF5ZR1FF0VFMN4NX3`