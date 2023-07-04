import { ethers } from 'ethers';
import { INPUTS, NETWORKS } from '../constants/constants'
import { InvalidNetworkException } from "../exceptions/InvalidNetworkException";
import { InvalidEnvironmentDataException } from "../exceptions/InvalidEnvironmentDataException";
import { createListing, buyListing, cancelListing, createOffer, acceptOffer, cancelOffer, buyListingByAcceptedOffer } from "./contractInteractions";
import { InvalidInputException } from "../exceptions/InvalidInputException";

const nftMarketplaceJson = require('../../contracts/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json')
const commands: { [key: string]: string; }  = {};
Object.assign(commands, Object.entries(INPUTS).forEach(([k, v]) => {commands[k] = v.command}));

export async function proceedCommand(contract: ethers.Contract, signer: ethers.Wallet, command: string, firstParam: any, secondParam: any, thirdParam: any) {
    switch (command) {
        case commands.CREATE_LISTING:
            await createListing(contract, firstParam, secondParam, thirdParam);

            break;
        case commands.BUY_LISTING:
            await buyListing(contract, firstParam, secondParam);

            break;
        case commands.CANCEL_LISTING:
            await cancelListing(contract, firstParam);

            break;
        case commands.CREATE_OFFER:
            await createOffer(contract, firstParam, secondParam);

            break;
        case commands.ACCEPT_OFFER:
            await acceptOffer(contract, firstParam);

            break;
        case commands.CANCEL_OFFER:
            await cancelOffer(contract, firstParam);

            break;
        case commands.BUY_LISTING_BY_ACCEPTED_OFFER:
            await buyListingByAcceptedOffer(contract, firstParam, secondParam);

            break;
        default:
            throw new InvalidInputException('Unknown command');
    }
}

export function getProvider(network: string) {
    switch (network) {
        case NETWORKS.LOCALHOST:
            return new ethers.providers.JsonRpcProvider(process.env['LOCALHOST_NODE_URL']);
        case NETWORKS.SEPOLIA:
            return new ethers.providers.InfuraProvider('sepolia', process.env['INFURA_SEPOLIA_API_KEY']);
        default:
            throw new InvalidNetworkException(`Invalid network passed for getting provider`);
    }
}

export function getSigner(provider: ethers.providers.BaseProvider, network: string) {
    const priv = process.env[network.toUpperCase() + '_USER_PRIVATE_KEY'];
    if (!priv) throw new InvalidEnvironmentDataException('No private key provided.');

    return new ethers.Wallet(priv, provider);
}

export function getContract(network: string, signer: ethers.Wallet) {
    const contractAddress = process.env[network + '_CONTRACT_ADDRESS'];
    if (!contractAddress) throw new InvalidEnvironmentDataException('No contract address provided.');

    return new ethers.Contract(contractAddress, nftMarketplaceJson.abi, signer);
}
