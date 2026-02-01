import { ethers } from 'ethers';

// Version 3: ID-Based Portfolio Support (Zero-Wallet for Students)
export const CONTRACT_ADDRESS = "0xDaDea6be84CFb181A7bfa50807cF72698d1de644";

export const CONTRACT_ABI = [
  "function issueCertificate(string memory _id, string memory _ipfsHash, string memory _studentName, string memory _studentId, address _recipient) public",
  "function issueBatch(string[] memory _ids, string[] memory _ipfsHashes, string[] memory _studentNames, string[] memory _studentIds, address[] memory _recipients) public",
  "function revokeCertificate(string memory _id) public",
  "function getCertificate(string memory _id) public view returns (string memory, string memory, uint256, string memory, string memory, address, bool)",
  "function getCertificatesByStudentId(string memory _studentId) public view returns (string[] memory)",
  "event CertificateIssued(string indexed id, string studentId, string studentName)",
  "event CertificateRevoked(string indexed id)"
];

export const getEthereumContract = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getReadOnlyContract = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}
