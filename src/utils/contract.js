import { ethers } from 'ethers';

// Version 3: ID-Based Portfolio Support (Zero-Wallet for Students)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xDaDea6be84CFb181A7bfa50807cF72698d1de644";

export const CONTRACT_ABI = [
  "function issueCertificate(string memory _id, string memory _ipfsHash, string memory _studentName, string memory _studentId, address _recipient) public",
  "function issueBatch(string[] memory _ids, string[] memory _ipfsHashes, string[] memory _studentNames, string[] memory _studentIds, address[] memory _recipients) public",
  "function registerStudent(string memory _name, string memory _studentId, string memory _department, address _wallet) public",
  "function registerBatch(string[] memory _names, string[] memory _studentIds, string[] memory _departments, address[] memory _wallets) public",
  "function revokeCertificate(string memory _id) public",
  "function getCertificate(string memory _id) public view returns (string memory, string memory, uint256, string memory, string memory, address, bool)",
  "function getCertificatesByStudentId(string memory _studentId) public view returns (string[] memory)",
  "function students(string memory _studentId) public view returns (string memory, string memory, string memory, address, bool, uint256)",
  "function allStudentIds(uint256 index) public view returns (string memory)",
  "function getAllStudents() public view returns (string[] memory)",
  "event CertificateIssued(string indexed id, string studentId, string studentName)",
  "event CertificateRevoked(string indexed id)"
];

export const getEthereumContract = async () => {
  if (!window.ethereum) {
    alert("MetaMask not found! Please install MetaMask to interact with the blockchain.");
    throw new Error("No crypto wallet found.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getReadOnlyContract = async () => {
  // Use MetaMask provider if available for standard read-only
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }

  // Fallback: If you have a public RPC URL, you could put it here
  // For now, we will still require a provider but can provide a better error in the UI.
  throw new Error("ENOMETA: MetaMask is required for blockchain verification.");
}
