// Contract address
const contractAddress = "0x168e93a8b3634c11212d97d8142d8ab211362012";

// Contract ABI
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

let provider;
let signer;
let contract;

// Connect wallet function
async function connectWallet() {
  try {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    // Request account access and switch to Sepolia if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Try to switch to Sepolia network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          alert('Failed to add Sepolia network. Please add it manually in MetaMask.');
          return;
        }
      } else {
        console.error('Failed to switch to Sepolia:', switchError);
      }
    }
    
    // Initialize provider and signer (MUST be after network switch)
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const userAccount = await signer.getAddress();
    
    // Check network
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
    console.log('Network detected:', network.name, chainId);
    
    if (chainId !== 11155111) {
      alert(`⚠️ Still on wrong network!\n\nCurrent: ${network.name} (${chainId})\nPlease manually switch to Sepolia in MetaMask and try again.`);
      document.getElementById('wallet').innerHTML = `<span style="color: red;">❌ Wrong network: ${network.name} (${chainId})</span>`;
      return;
    }
    
    // Initialize contract
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Display connected wallet
    document.getElementById('wallet').innerHTML = `<span style="color: green;">✅ Connected: ${userAccount}<br>Network: Sepolia Testnet (${chainId})</span>`;
    
    console.log('Wallet connected:', userAccount);
    console.log('Network:', network.name, chainId);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Failed to connect wallet: ' + error.message);
  }
}

// Verify certificate function
async function verifyCert() {
  try {
    if (!contract) {
      alert('Please connect your wallet first!');
      return;
    }
    
    // Check network again
    const network = await provider.getNetwork();
    console.log('Verifying on network:', network.chainId);
    
    if (network.chainId !== 11155111) {
      alert('Please switch to Sepolia Testnet!');
      return;
    }

    const certHash = document.getElementById('hash').value.trim();
    
    if (!certHash) {
      alert('Please enter a certificate hash!');
      return;
    }
    
    document.getElementById('result').textContent = 'Verifying...';
    document.getElementById('result').style.color = 'blue';

    console.log('Calling contract at:', contractAddress);
    console.log('With hash:', certHash);
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      document.getElementById('result').style.color = 'red';
      document.getElementById('result').textContent = '❌ Error: Contract not found at this address on Sepolia! Please redeploy the contract.';
      console.error('No contract code at address:', contractAddress);
      return;
    }

    // Call the smart contract to verify certificate
    const result = await contract.verifyCertificate(certHash);
    console.log('Contract result:', result);
    
    const isValid = result[0];
    const issuer = result[1];
    
    const resultElement = document.getElementById('result');
    
    if (isValid) {
      resultElement.style.color = 'green';
      resultElement.textContent = `✓ Valid Certificate - Issued by: ${issuer}`;
    } else {
      resultElement.style.color = 'orange';
      resultElement.textContent = '✗ Certificate not found on blockchain (not uploaded yet)';
    }
    
  } catch (error) {
    console.error('Error verifying certificate:', error);
    document.getElementById('result').style.color = 'red';
    if (error.code === 'CALL_EXCEPTION') {
      document.getElementById('result').textContent = '⚠️ Error: Contract call failed. The contract may not exist on Sepolia at this address.';
    } else {
      document.getElementById('result').textContent = 'Error: ' + error.message;
    }
  }
}
