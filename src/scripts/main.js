// Funktion, um den gesamten Textinhalt der Seite zu erfassen
export const getPageText = () => {
    // Wähle alle Texte innerhalb des Hauptinhalts aus (z.B. innerhalb eines bestimmten Containers)
    const contentElement = document.querySelector('body'); // Passe den Selektor an, z.B. '.main-content'
    return contentElement ? contentElement.innerText : '';
};

export const askNotificationPermission = () => {
    return new Promise((resolve, reject) => {
        const permissionResult = Notification.requestPermission(result => {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(permissionResult => {
        if (permissionResult !== 'granted') {
            throw new Error('Permission not granted for Notification');
        }
    });
}

export const subscribeUserToPush = () => {
    return navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BGgWNLvItEqRELgjB-od0ni3X5RYi06q3ioU6xeKOpwaQMpp6qBSjyerDRJ-HNIajGTh00Jd0R2lgJM_E_RfUSM')
        });
    }).then(subscription => {
        // Sende die Subscription-Daten an deinen Server
        console.log('User is subscribed:', subscription);
        return subscription;
    }).catch(error => {
        console.error('Failed to subscribe the user: ', error);
    });
}

export const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
