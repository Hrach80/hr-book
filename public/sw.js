// Service Worker ֆոնային ծանուցումների և ձայնային ազդանշանների համար
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});

// Լսում ենք Push ծանուցումները սերվերից (Supabase-ից)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Հիշեցում', body: 'Ունեք մոտեցող իրադարձություն' };

    const options = {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200], // Թրթռոց հեռախոսների վրա
        sound: '/alert.mp3' // Ձայնային ազդանշան (եթե առկա է)
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Երբ օգտատերը սեղմում է ծանուցման վրա, բացվում է հավելվածը
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});