const fs = require("fs");
const solc = require("solc");
const { ethers } = require("ethers");

const GANACHE_RPC_URL = "http://127.0.0.1:7545";
const PRIVATE_KEY = "0x85c17fb8175a9b69a6db671d4f8c070581256c869e07897343ce3b7c6f21d22c"; 

async function main() {
    console.log("🛠️  Reading EligibilityLogger.sol...");
    const source = fs.readFileSync("EligibilityLogger.sol", "utf8");

    const input = {
        language: "Solidity",
        sources: {
            "EligibilityLogger.sol": {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["*"],
                },
            },
           evmVersion: "paris", // Ensure compatibility with Ganache out of the box
        },
    };

    console.log("⚙️  Compiling Smart Contract...");
    const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));

    if (tempFile.errors) {
        console.error("Compilation Errors:", tempFile.errors);
        return;
    }

    const contractFile = tempFile.contracts["EligibilityLogger.sol"]["EligibilityLogger"];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    console.log("🔌 Connecting to Ganache...");
    const provider = new ethers.JsonRpcProvider(GANACHE_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("🚀 Deploying Smart Contract to the Blockchain...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Deploy and wait for confirmation
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`\n========================================`);
    console.log(`✅ SUCCESSFULLY DEPLOYED TO GANACHE!`);
    console.log(`========================================`);
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`\nModify logger.js to use this new address!`);

    // Let's even auto-update logger.js for the user
    let loggerCode = fs.readFileSync("logger.js", "utf8");
    loggerCode = loggerCode.replace(/const CONTRACT_ADDRESS = ".*";/, `const CONTRACT_ADDRESS = "${contractAddress}";`);
    fs.writeFileSync("logger.js", loggerCode);
    console.log(`\n✨ Bonus: I automatically updated logger.js with the correct address for you!`);
    console.log(`You can now simply run: node logger.js`);
}

main().catch(console.error);
