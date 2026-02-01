# User Guide: Setting Up CertChain

This guide will walk you through the steps required to get your Blockchain Certificate Verification System running.

## 1. Prerequisites
- **Node.js** installed on your machine.
- **MetaMask** browser extension installed.
- A **Pinata** account (for IPFS storage).

## 2. Setup Pinata (IPFS)
1. Go to [Pinata Cloud](https://app.pinata.cloud/) and sign up.
2. Go to the **API Keys** section and generate a new key.
3. Copy the **JWT (JSON Web Token)**.
4. Open `src/utils/pinata.js` in your VS Code.
5. Replace `PASTE_YOUR_PINATA_JWT_HERE` with your actual JWT.

## 3. Deploy the Smart Contract
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a new file named `CertificateRegistry.sol` and paste the code from `src/contracts/CertificateRegistry.sol`.
3. In the "Solidity Compiler" tab, click **Compile**.
4. In the "Deploy & Run Transactions" tab:
   - Environment: Select **Injected Provider - MetaMask** (Make sure your MetaMask is on Sepolia or a similar testnet).
   - Click **Deploy**.
5. Once deployed, copy the **Contract Address**.
6. Open `src/utils/contract.js` and paste the address into the `CONTRACT_ADDRESS` constant.

## 4. Run the Application
1. In your terminal, run:
   ```bash
   npm install
   npm run dev
   ```
2. Open the provided Localhost URL (usually `http://localhost:5173`).

## 5. How to Use
- **Issue Certificate**: Go to the "Issue Certificate" page, fill in the details, upload a PDF, and confirm the MetaMask transaction.
- **Verify**: Go to the "Verify Details" page, enter the Certificate ID you used during issuance, and see the blockchain-verified results.

---
**Note:** Ensure your MetaMask has some test ETH (e.g., Sepolia ETH) to pay for gas when issuing certificates.
