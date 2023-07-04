import { ethers } from 'ethers';

export async function createListing(contract: ethers.Contract, erc721contract: string, tokenId: number, priceInWei: string) {
    try {
        const createListingReceipt = await contract.createListing(erc721contract, tokenId, priceInWei);
        const createListingReceiptResult = await createListingReceipt.wait();
        const createListingGasUsed = ethers.utils.formatUnits(createListingReceiptResult.gasUsed, 'gwei');

        console.log(`Listing created in tx with hash ${createListingReceiptResult.transactionHash} in block ${createListingReceiptResult.blockNumber}; gas used: ${createListingGasUsed}`);
    } catch (err) {
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
        console.log(err);
    }
}

export async function createOffer(contract: ethers.Contract, listingId: string, offeredPriceInWei: string) {
    try {
        const createOfferReceipt = await contract.createOffer(listingId, offeredPriceInWei);
        const createOfferReceiptResult = await createOfferReceipt.wait();
        const createOfferGasUsed = ethers.utils.formatUnits(createOfferReceiptResult.gasUsed, 'gwei');

        console.log(`Offer created in tx with hash ${createOfferReceiptResult.transactionHash} in block ${createOfferReceiptResult.blockNumber}; gas used: ${createOfferGasUsed}`);
    } catch (err) {
        console.log(err)
    }
}

export async function acceptOffer(contract: ethers.Contract, offerId: string) {
    try {
        const acceptOfferReceipt = await contract.acceptOffer(offerId);
        const acceptOfferReceiptResult = await acceptOfferReceipt.wait();
        const acceptOfferGasUsed = ethers.utils.formatUnits(acceptOfferReceiptResult.gasUsed, 'gwei');

        console.log(`Offer accepted in tx with hash ${acceptOfferReceiptResult.transactionHash} in block ${acceptOfferReceiptResult.blockNumber}; gas used: ${acceptOfferGasUsed}`);
    } catch (err) {
        console.log(err)
    }
}

export async function cancelOffer(contract: ethers.Contract, offerId: string) {
    try {
        const cancelOfferReceipt = await contract.cancelOffer(offerId);
        const cancelOfferReceiptResult = await cancelOfferReceipt.wait();
        const cancelOfferGasUsed = ethers.utils.formatUnits(cancelOfferReceiptResult.gasUsed, 'gwei');

        console.log(`Offer canceled in tx with hash ${cancelOfferReceiptResult.transactionHash} in block ${cancelOfferReceiptResult.blockNumber}; gas used: ${cancelOfferGasUsed}`);
    } catch (err) {
        console.log(err)
    }
}

export async function buyListingByAcceptedOffer(contract: ethers.Contract, offerId: string, offerPriceInWei: string) {
    try {
        const buyListingByAcceptedOfferReceipt = await contract.buyListingByAcceptedOffer(offerId, {value: offerPriceInWei});
        const buyListingByAcceptedOfferReceiptResult = await buyListingByAcceptedOfferReceipt.wait();
        const gasUsed = ethers.utils.formatUnits(buyListingByAcceptedOfferReceiptResult.gasUsed, 'gwei');

        console.log(`Listing bought in tx with hash ${buyListingByAcceptedOfferReceiptResult.transactionHash} in block ${buyListingByAcceptedOfferReceiptResult.blockNumber}; gas used: ${gasUsed}`);
    } catch (err) {
        console.log(err)
    }
}
