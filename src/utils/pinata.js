import axios from 'axios';

// TODO: Replace with your Pinata JWT (JSON Web Token)
// You can get this from https://app.pinata.cloud/developers/api-keys
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "PASTE_YOUR_PINATA_JWT_HERE";

export const uploadToPinata = async (file) => {
    if (PINATA_JWT === "PASTE_YOUR_PINATA_JWT_HERE") {
        throw new Error("Please set your Pinata JWT in src/utils/pinata.js");
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
        name: `Certificate-${Date.now()}`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                // Axios sets Content-Type including boundary automatically
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });
        return res.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw error;
    }
};
