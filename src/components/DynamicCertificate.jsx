import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaEye } from 'react-icons/fa';

const DynamicCertificate = ({ templateUrl, studentName, timestamp, certId }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous"; // Essential for IPFS images
        img.src = `https://gateway.pinata.cloud/ipfs/${templateUrl}`;

        img.onload = () => {
            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw Background Template
            ctx.drawImage(img, 0, 0);

            // Configure Text Styling
            // Note: coordinates (x, y) might need adjustment based on your specific template
            // We assume a standard layout where the name goes in the middle
            ctx.fillStyle = "#d4af37"; // Gold-ish color for the name
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Dynamic Font Size based on image scale
            const fontSize = Math.floor(img.height * 0.08);
            ctx.font = `italic bold ${fontSize}px "Outfit", sans-serif`;

            // Draw Student Name in the center area
            // x = middle, y = roughly 55% down the page (standard certificate spot)
            ctx.fillText(studentName, img.width / 2, img.height * 0.54);

            // Optional: Draw Cert ID or Date at the bottom
            ctx.font = `${Math.floor(img.height * 0.02)}px "monospace"`;
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillText(`Verify ID: ${certId} | Issued: ${timestamp}`, img.width / 2, img.height * 0.92);
        };
    }, [templateUrl, studentName, timestamp, certId]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `Certificate_${studentName.replace(/ /g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '10px', overflow: 'hidden', maxWidth: '100%', background: 'white' }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '8px'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={handleDownload} className="btn-primary">
                    <FaDownload /> Download Signed Copy
                </button>
                <a
                    href={`https://gateway.pinata.cloud/ipfs/${templateUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                >
                    <FaEye /> View Raw Template
                </a>
            </div>
        </div>
    );
};

export default DynamicCertificate;
