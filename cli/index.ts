import { config } from 'dotenv';
import { validateNetwork, validateCommand, validateDotEnvFile } from './validations/validator';
import { getContract, getProvider, getSigner, proceedCommand } from "./services/contractService";

config();
export async function main() {
    const network: string = process.argv[2].toLowerCase();
    const command: string = process.argv[3];
    const firstParam: any = process.argv[4];
    const secondParam: any = process.argv[5];
    const thirdParam: any = process.argv[6];

    validateNetwork(network);
    validateCommand(command, firstParam, secondParam, thirdParam);
    validateDotEnvFile(network);

    const provider = getProvider(network);
    const signer = getSigner(provider, network);
    const contract = getContract(network, signer);

    await proceedCommand(contract, signer, command, firstParam, secondParam, thirdParam);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
