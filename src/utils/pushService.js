import { supabase } from '../services/supabaseClient';

// ՎԱՊԻԴ հանրային բանալի (VAPID Public Key) - ծանուցումների ստորագրման համար
// Ծանոթագրություն. Այս բանալին պետք է համապատասխանի այն VAPID բանալիներին, որոնք կօգտագործվեն սերվերային կողմից:
const publicVapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeUserToPush() {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push messaging is not supported');
            return;
        }

        const registration = await navigator.serviceWorker.ready;

        // Ստուգում ենք՝ արդյոք արդեն բաժանորդագրված է
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
        }

        // Ստանում ենք ընթացիկ օգտատիրոջ ID-ն Supabase-ից
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Պահպանում ենք կամ թարմացնում ենք բանալին Supabase-ում
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert([
                { user_id: user.id, subscription: subscription }
            ], { onConflict: 'user_id' });

        if (error) throw error;
        console.log('Push subscription saved successfully to Supabase!');

    } catch (error) {
        console.error('Failed to subscribe the user: ', error);
    }
}