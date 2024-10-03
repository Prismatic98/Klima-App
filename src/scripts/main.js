// Funktion, um den gesamten Textinhalt der Seite zu erfassen
export const getPageText = () => {
    // Wähle alle Texte innerhalb des Hauptinhalts aus (z.B. innerhalb eines bestimmten Containers)
    const contentElement = document.querySelector('body'); // Passe den Selektor an, z.B. '.main-content'
    return contentElement ? contentElement.innerText : '';
};

// Überprüfe, ob eine Notification/Modal gesendet werden darf
export const canSendNotification = (currentLocation) => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const notificationsEnabled = savedSettings?.notificationsEnabled;
    //const locationThreshold = 60 * 1000; // 60 Sekunden in Millisekunden
    //const currentTime = Date.now(); // Aktuelle Zeit in Millisekunden

    // Hole den letzten Standort und Zeitstempel aus dem localStorage
    const lastLocation = JSON.parse(localStorage.getItem('lastLocation'));
    //const lastNotificationTime = localStorage.getItem('lastNotificationTime') || 0;

    // Prüfe, ob es 10 Sekunden her ist oder ob der Standort anders ist
    // if ((!lastLocation || currentLocation.name !== lastLocation.name || (currentTime - lastNotificationTime) > locationThreshold) && notificationsEnabled) {
    if ((!lastLocation || currentLocation.name !== lastLocation.name) && notificationsEnabled) {
        // Aktualisiere den letzten Standort und den Zeitstempel im localStorage
        localStorage.setItem('lastLocation', JSON.stringify(currentLocation));
        //localStorage.setItem('lastNotificationTime', currentTime);

        return true;  // Benachrichtigung darf gesendet werden
    }

    return false;  // Benachrichtigung darf nicht gesendet werden
};


export const sendNotification = async (title, options) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Überprüfe, ob ein Service Worker registriert ist
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, options);
    } else if ('Notification' in window) {
        // Überprüfe, ob Notifications im Fenster unterstützt werden
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
            // Fordere die Benachrichtigungsberechtigung an
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, options);
                }
            });
        }
    } else {
        console.log('Benachrichtigungen werden von diesem Browser nicht unterstützt.');
    }
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Erdradius in Metern
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distanz in Metern
    return distance;
}

export const arrayToTextContent = (arr) => {
    return arr.map((item, index) => {
        // Überprüfe, ob das Element ein Objekt oder ein Array ist
        if (typeof item === 'object') {
            return `Item ${index + 1}: ${JSON.stringify(item, null, 2)}`;
        }
        return `Item ${index + 1}: ${item}`;
    }).join('\n'); // Verbinde alle Elemente mit einem Zeilenumbruch
};

export const getSystemInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language;
    const browserName = navigator.appName;

    return {
        userAgent,
        platform,
        screenResolution,
        language,
        browserName,
    };
};

export const getCurrentDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Monate beginnen bei 0
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
