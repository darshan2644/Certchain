import emailjs from '@emailjs/browser';

/**
 * Sends a certificate issuance notification email to the student
 * 
 * NOTE: To make this work, you must replace the placeholders below with 
 * your actual EmailJS credentials from https://dashboard.emailjs.com/
 */
export const sendCertificateEmail = async (studentEmail, studentName, certId) => {
    if (!studentEmail) {
        console.warn("No email provided for student:", studentName);
        return;
    }

    // Replace these with your actual EmailJS credentials
    const SERVICE_ID = 'service_certchain';
    const TEMPLATE_ID = 'template_certificate';
    const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

    const templateParams = {
        to_name: studentName,
        cert_id: certId,
        verify_link: `${window.location.origin}/verify?id=${certId}`,
        to_email: studentEmail,
        reply_to: 'admin@certchain.edu'
    };

    try {
        // We only attempt to send if a public key is provided to avoid console errors during dev
        if (PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
            const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            console.log('Email successfully sent!', result.text);
            return true;
        } else {
            console.log('--- EMAIL SIMULATION ---');
            console.log('To:', studentEmail);
            console.log('Subject: Your Blockchain Certificate is Ready!');
            console.log('Params:', templateParams);
            console.log('-------------------------');
            return true;
        }
    } catch (error) {
        console.error('Email failed to send:', error);
        return false;
    }
};
