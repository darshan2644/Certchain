export const pushNotification = (message, type = 'info') => {
    const notifications = JSON.parse(localStorage.getItem('certchain_notifications') || '[]');
    const newNotif = {
        id: Date.now(),
        message,
        type,
        time: new Date().toISOString(),
        read: false
    };

    // Add to start of array
    const updated = [newNotif, ...notifications].slice(0, 50); // Keep last 50
    localStorage.setItem('certchain_notifications', JSON.stringify(updated));

    // Dispatch custom event for the Navbar to listen to
    window.dispatchEvent(new Event('new_notification'));
};
