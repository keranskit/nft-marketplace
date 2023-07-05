import {ethers} from "ethers";
import { INPUTS, NETWORKS } from '../constants/constants';
import { InvalidInputException } from "../exceptions/InvalidInputException";
import { InvalidNetworkException } from "../exceptions/InvalidNetworkException";
import {InvalidEnvironmentDataException} from "../exceptions/InvalidEnvironmentDataException";
const allowedCommands = Object.assign([], Object.values(INPUTS).map(e => e.command));
const commandAdditionalParams: { [key: string]: number; }  = {};
Object.entries(INPUTS).forEach(([k, v]) => {commandAdditionalParams[v.command] = v.additionalParamsCount});
const allowedNetworks = Object.assign([], Object.entries(NETWORKS).map(e => e[1]));

export function validateAddress(address: string|undefined) {
    if (typeof address === 'undefined') return false;
    return ethers.utils.isAddress(address);
}

export function validateNetwork(network: string) {
    if (!allowedNetworks.includes(network)) throw new InvalidInputException(`Invalid network. Should be one of ${allowedNetworks}`);
}

export function validateCommand(command: string, firstParam: any, secondParam: any, thirdParam: any) {
    if (!allowedCommands.includes(command)) throw new InvalidInputException(`Invalid command. Should be one of ${allowedCommands}`);

    if (commandAdditionalParams[command] === 1 && !firstParam) throw new InvalidInputException(`Invalid additional params.`);
    if (commandAdditionalParams[command] === 2 && (!firstParam || !secondParam)) throw new InvalidInputException(`Invalid additional params.`);
    if (commandAdditionalParams[command] === 3 && (!firstParam || !secondParam || !thirdParam)) throw new InvalidInputException(`Invalid additional params.`);
}

export function validateDotEnvFile(network: string) {
    switch (network) {
        case NETWORKS.LOCALHOST:
            return validateLocalhostEnvironment();
        case NETWORKS.SEPOLIA:
            return validateSepoliaEnvironment();
        default:
            throw new InvalidNetworkException(`Invalid network passed for validating .env file`);
    }
}

export function validateSepoliaEnvironment() {
    const apiKey = process.env['INFURA_SEPOLIA_API_KEY']
    const contractAddress = process.env['SEPOLIA_CONTRACT_ADDRESS']
    const userPriv = process.env['SEPOLIA_USER_PRIVATE_KEY']
    const isValidAddress = validateAddress(contractAddress);

    if (!apiKey || !contractAddress || !userPriv || !isValidAddress) {
        throw new InvalidEnvironmentDataException('Invalid .env file.');
    }
}

export function validateLocalhostEnvironment() {
    const nodeUrl = process.env['LOCALHOST_NODE_URL']
    const contractAddress = process.env['LOCALHOST_CONTRACT_ADDRESS']
    const userPriv = process.env['LOCALHOST_USER_PRIVATE_KEY']
    const isValidAddress = validateAddress(contractAddress);

    if (!nodeUrl || !contractAddress || !userPriv || !isValidAddress) {
        throw new InvalidEnvironmentDataException('Invalid .env file.');
    }
}
