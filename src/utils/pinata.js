import axios from 'axios';

// TODO: Replace with your Pinata JWT (JSON Web Token)
// You can get this from https://app.pinata.cloud/developers/api-keys
export const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0MzhiMmJhNi1iYjgwLTRkYmQtYWVjMy05NzNmZjg4M2E0ZTYiLCJlbWFpbCI6IjIzY3MxMDJAY2hhcnVzYXQuZWR1LmluIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImU1ZDU5ODUwZDYzYTRiMzFkNThhIiwic2NvcGVkS2V5U2VjcmV0IjoiZThjOGQwNWU5MTRmNzg3YWQ5MTY1ZWVkNmJmYzQwYTkxODU0MDVkNjIzZDQzYTIyNGIyZjk0NDE0ODQyYmM1MiIsImV4cCI6MTgwMTQ1OTk3Mn0.sU_mxJyUDv-7N4a4qjKVi7ui_ocqMX0uVB8QhfkK2Fg";

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
