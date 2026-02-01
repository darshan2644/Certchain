// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certificate {
    address public owner;
    
    // Mapping to store certificate hash => issuer address
    mapping(string => address) public certificates;
    
    event CertificateUploaded(string certHash, address indexed issuer);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Upload a certificate (only owner can upload)
    function uploadCertificate(string memory certHash) public {
        require(msg.sender == owner, "Only owner can upload certificates");
        require(certificates[certHash] == address(0), "Certificate already exists");
        
        certificates[certHash] = msg.sender;
        emit CertificateUploaded(certHash, msg.sender);
    }
    
    // Verify if a certificate exists and return issuer
    function verifyCertificate(string memory certHash) public view returns (bool, address) {
        address issuer = certificates[certHash];
        if (issuer != address(0)) {
            return (true, issuer);
        } else {
            return (false, address(0));
        }
    }
}
