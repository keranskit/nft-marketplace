import { ethers } from 'ethers';

export async function createListing(contract: ethers.Contract, erc721contract: string, tokenId: number, priceInWei: string) {
    try {
        const createListingReceipt = await contract.createListing(erc721contract, tokenId, priceInWei);
        const createListingReceiptResult = await createListingReceipt.wait();
        const createListingGasUsed = ethers.utils.formatUnits(createListingReceiptResult.gasUsed, 'gwei');

        console.log(`Listing created in tx with hash ${createListingReceiptResult.transactionHash} in block ${createListingReceiptResult.blockNumber}; gas used: ${createListingGasUsed}`);
    } catch (err) {
        //todo fix error handling https://dev.to/george_k/embracing-custom-errors-in-solidity-55p8
        console.log(err)
    }
}

export async function buyListing(contract: ethers.Contract, listingId: number, priceInWei: string) {
    try {
        const buyListingReceipt = await contract.buyListing(listingId, {value: priceInWei});
        const buyListingReceiptResult = await buyListingReceipt.wait();
        const buyListingGasUsed = ethers.utils.formatUnits(buyListingReceiptResult.gasUsed, 'gwei');

        console.log(`Listing bought in tx with hash ${buyListingReceiptResult.transactionHash} in block ${buyListingReceiptResult.blockNumber}; gas used: ${buyListingGasUsed}`);
    } catch (err) {
        //todo fix error handling https://dev.to/george_k/embracing-custom-errors-in-solidity-55p8
        console.log(err);
    }
}

export async function cancelListing(contract: ethers.Contract, listingId: number) {
    try {
        const cancelListingReceipt = await contract.cancelListing(listingId);
        const cancelListingReceiptResult = await cancelListingReceipt.wait();
        const cancelListingGasUsed = ethers.utils.formatUnits(cancelListingReceiptResult.gasUsed, 'gwei');

        console.log(`Listing canceled in tx with hash ${cancelListingReceiptResult.transactionHash} in block ${cancelListingReceiptResult.blockNumber}; gas used: ${cancelListingGasUsed}`);
    } catch (err) {
        //todo fix error handling https://dev.to/george_k/embracing-custom-errors-in-solidity-55p8
        console.log(err);
    }
}
