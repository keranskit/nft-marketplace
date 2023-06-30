import {ethers} from "hardhat";
import {config} from "dotenv";
config();

const E721Json = require('../artifacts/contracts/E721.sol/E721.json')

export async function main(_privateKey: any) {
    const wallet = new ethers.Wallet(_privateKey, ethers.provider);
    const e721Address = process.env.E721_ADDRESS;

    // @ts-ignore
    const contract = new ethers.Contract(e721Address, E721Json.abi, wallet);

    const res = await contract.faucet();
    const receiptResult = await res.wait();

    console.log(`${wallet.address} called 'Faucet' in tx with hash ${receiptResult.transactionHash}`);
}
