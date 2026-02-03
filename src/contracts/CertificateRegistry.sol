// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address public admin;

    struct Student {
        string name;
        string studentId;
        string department;
        address wallet;
        bool registered;
        uint256 registeredAt;
    }

    struct Certificate {
        string id;
        string ipfsHash;
        uint256 timestamp;
        string studentName;
        string studentId; // Linked to University ID
        address recipient; // Optional for wallet ownership
        bool exists;
        bool revoked;
    }

    mapping(string => Student) public students; // studentId -> Student
    string[] public allStudentIds;
    mapping(string => Certificate) public certificates;
    mapping(string => string[]) public idToCerts; // Mapping studentId -> list of cert IDs
    
    event CertificateIssued(string indexed id, string studentId, string studentName);
    event CertificateRevoked(string indexed id);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(
        string memory _name,
        string memory _studentId,
        string memory _department,
        address _wallet
    ) public onlyAdmin {
        require(!students[_studentId].registered, "Student already registered");
        
        students[_studentId] = Student({
            name: _name,
            studentId: _studentId,
            department: _department,
            wallet: _wallet,
            registered: true,
            registeredAt: block.timestamp
        });
        
        allStudentIds.push(_studentId);
    }

    function registerBatch(
        string[] memory _names,
        string[] memory _studentIds,
        string[] memory _departments,
        address[] memory _wallets
    ) public onlyAdmin {
        require(_names.length == _studentIds.length && _names.length == _departments.length && _names.length == _wallets.length, "Arrays length mismatch");
        
        for(uint i = 0; i < _names.length; i++) {
            if(!students[_studentIds[i]].registered) {
                students[_studentIds[i]] = Student({
                    name: _names[i],
                    studentId: _studentIds[i],
                    department: _departments[i],
                    wallet: _wallets[i],
                    registered: true,
                    registeredAt: block.timestamp
                });
                allStudentIds.push(_studentIds[i]);
            }
        }
    }

    function getAllStudents() public view returns (string[] memory) {
        return allStudentIds;
    }

    function issueCertificate(
        string memory _id, 
        string memory _ipfsHash, 
        string memory _studentName, 
        string memory _studentId,
        address _recipient
    ) public onlyAdmin {
        require(!certificates[_id].exists, "Certificate ID already exists");
        
        certificates[_id] = Certificate({
            id: _id,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            studentName: _studentName,
            studentId: _studentId,
            recipient: _recipient,
            exists: true,
            revoked: false
        });

        idToCerts[_studentId].push(_id);
        emit CertificateIssued(_id, _studentId, _studentName);
    }

    function issueBatch(
        string[] memory _ids, 
        string[] memory _ipfsHashes, 
        string[] memory _studentNames, 
        string[] memory _studentIds,
        address[] memory _recipients
    ) public onlyAdmin {
        require(
            _ids.length == _ipfsHashes.length && 
            _ids.length == _studentNames.length && 
            _ids.length == _studentIds.length &&
            _ids.length == _recipients.length, 
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < _ids.length; i++) {
            require(!certificates[_ids[i]].exists, "One of the Certificate IDs already exists");
            
            certificates[_ids[i]] = Certificate({
                id: _ids[i],
                ipfsHash: _ipfsHashes[i],
                timestamp: block.timestamp,
                studentName: _studentNames[i],
                studentId: _studentIds[i],
                recipient: _recipients[i],
                exists: true,
                revoked: false
            });

            idToCerts[_studentIds[i]].push(_ids[i]);
            emit CertificateIssued(_ids[i], _studentIds[i], _studentNames[i]);
        }
    }

    function revokeCertificate(string memory _id) public onlyAdmin {
        require(certificates[_id].exists, "Certificate does not exist");
        require(!certificates[_id].revoked, "Certificate already revoked");
        
        certificates[_id].revoked = true;
        emit CertificateRevoked(_id);
    }

    function getCertificatesByStudentId(string memory _studentId) public view returns (string[] memory) {
        return idToCerts[_studentId];
    }

    function getCertificate(string memory _id) public view returns (
        string memory, 
        string memory, 
        uint256, 
        string memory, 
        string memory, 
        address, 
        bool
    ) {
        require(certificates[_id].exists, "Certificate does not exist");
        Certificate memory cert = certificates[_id];
        return (cert.id, cert.ipfsHash, cert.timestamp, cert.studentName, cert.studentId, cert.recipient, cert.revoked);
    }
}
