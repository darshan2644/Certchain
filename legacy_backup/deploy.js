// Deployment script for Certificate contract
// This script uses ethers.js to deploy the contract

async function deployCertificate() {
  try {
    console.log("Starting deployment...");
    
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Check if on Sepolia
    if (network.chainId !== 11155111) {
      alert(`Please switch to Sepolia Testnet! Current network: ${network.name}`);
      return;
    }

    // Contract bytecode and ABI
    const contractBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610668806100606000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80635e01eb5a146100515780638da5cb5b1461006d578063b1d5c0c41461008b578063cf31ef01146100a7575b600080fd5b61006b60048036038101906100669190610395565b6100d7565b005b6100756101ee565b6040516100829190610409565b60405180910390f35b6100a560048036038101906100a09190610395565b610212565b005b6100c160048036038101906100bc9190610395565b6103a3565b6040516100ce91906104b8565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610165576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161015c90610536565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166001826040516101ad9190610592565b908152602001604051809103902060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146102eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102e2906105f5565b60405180910390fd5b336001826040516103029190610592565b908152602001604051809103902060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550803373ffffffffffffffffffffffffffffffffffffffff167f8e123f3c41f3bb0e3425c77a8f0c99f39dd97f5e0c06e8b84e2e7a3f3f3e3f3f60405160405180910390a350565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600183604051610225919061059a565b908152602001604051809103902060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905060008173ffffffffffffffffffffffffffffffffffffffff16141561028d576000801b809350935050506102f3565b600181809350935050505b92509050915091565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6103078261028e565b810181811067ffffffffffffffff821117156103265761032561029f565b5b80604052505050565b6000610339610279565b905061034582826102fe565b919050565b600067ffffffffffffffff8211156103655761036461029f565b5b61036e8261028e565b9050602081019050919050565b82818337600083830152505050565b600061039d6103988461034a565b61032f565b9050828152602081018484840111156103b9576103b8610289565b5b6103c484828561037b565b509392505050565b600082601f8301126103e1576103e0610284565b5b81356103f184826020860161038a565b91505092915050565b60006020828403121561041057600080fd5b600082013567ffffffffffffffff81111561042a57600080fd5b610436848285016103cc565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061046a8261043f565b9050919050565b61047a8161045f565b82525050565b600082825260208201905092915050565b60006104a06020830184610471565b905092915050565b6000602082019050919050565b60006104c18385610480565b93506104ce838584610490565b6104d7836104a8565b840190509392505050565b6000819050919050565b60006104f86020830183018461083565b905092915050565b6000602082019050919050565b600061051c60208301846104e3565b905092915050565b60006105318484836104b5565b905092915050565b6000602082019050919050565b600061055360208301846104ff565b905092915050565b60008151905061056a8161083e565b92915050565b6000602082840312156105865761058561027f565b5b60006105948482850161055b565b91505092915050565b60006105a882610439565b6105b281856105b7565b93506105c28185602086016105cd565b80840191505092915050565b60005b838110156105ec5780820151818401526020810190506105d1565b50505050565b60006105ff6020836105b7565b915061060a8261060d565b602082019050919050565b7f4f6e6c79206f776e65722063616e2075706c6f6164206365727469666963617460008201527f6573000000000000000000000000000000000000000000000000000000000000602082015250565b6000610671602283610480565b915061067c8261060d565b604082019050919050565b600060208201905081810360008301526106a081610664565b9050919050565b7f43657274696669636174652061697265616479206578697374730000000000600082015250565b60006106dd601a83610480565b91506106e8826106a7565b602082019050919050565b6000602082019050818103600083015261070c816106d0565b905091905056fea264697066735822122068d0f8e34c8e3b3a8b3f3e3d3c3b3a393837363534333231302f2e2d2c2b2a29282726252423222120";
    
    const contractABI = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "string", "name": "certHash", "type": "string" },
          { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }
        ],
        "name": "CertificateUploaded",
        "type": "event"
      },
      {
        "inputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "name": "certificates",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "string", "name": "certHash", "type": "string" }],
        "name": "uploadCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "string", "name": "certHash", "type": "string" }],
        "name": "verifyCertificate",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" },
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    console.log("Creating contract factory...");
    const factory = new ethers.ContractFactory(contractABI, contractBytecode, signer);
    
    console.log("Deploying contract... Please confirm the transaction in MetaMask");
    const contract = await factory.deploy();
    
    console.log("Waiting for deployment to be mined...");
    console.log("Transaction hash:", contract.deployTransaction.hash);
    
    await contract.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log("Contract address:", contract.address);
    console.log("Deployer address:", await signer.getAddress());
    
    // Display results
    document.getElementById('deployResult').innerHTML = `
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <h3 style="color: #155724;">✅ Deployment Successful!</h3>
        <p><strong>Contract Address:</strong><br><code style="background: white; padding: 5px; display: block; word-break: break-all;">${contract.address}</code></p>
        <p><strong>Transaction Hash:</strong><br><code style="background: white; padding: 5px; display: block; word-break: break-all;">${contract.deployTransaction.hash}</code></p>
        <p><strong>Network:</strong> ${network.name} (${network.chainId})</p>
        <p style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 3px;">
          ⚠️ <strong>Important:</strong> Copy the contract address above and update it in <code>app.js</code>
        </p>
      </div>
    `;
    
    return contract.address;
    
  } catch (error) {
    console.error('Deployment error:', error);
    document.getElementById('deployResult').innerHTML = `
      <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <h3 style="color: #721c24;">❌ Deployment Failed</h3>
        <p><strong>Error:</strong> ${error.message}</p>
      </div>
    `;
  }
}
