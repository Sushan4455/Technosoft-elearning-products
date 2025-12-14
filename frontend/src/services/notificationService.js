import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const createNotification = async (userId, title, message, type = 'info') => {
    try {
        await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
            userId,
            title,
            message,
            type, // info, success, warning, error
            read: false,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

export const getUserNotifications = async (userId) => {
    try {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        // Fallback for indexing errors or permission issues
        console.warn("Notification fetch warning:", error);
        return [];
    }
};

export const markNotificationRead = async (notificationId) => {
    try {
        await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
            read: true
        });
    } catch (error) {
        console.error("Error marking read:", error);
    }
};
