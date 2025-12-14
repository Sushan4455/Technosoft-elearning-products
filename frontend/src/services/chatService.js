import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    setDoc,
    doc,
    getDoc,
    limit
} from 'firebase/firestore';

/* ================= COLLECTION NAMES ================= */

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';
const USERS_COLLECTION = 'users';
const ENROLLMENTS_COLLECTION = 'enrollments';

/* ================= CREATE OR GET CHAT ================= */

export const getOrCreateChat = async (currentUserId, otherUserId) => {
    const sortedIds = [currentUserId, otherUserId].sort();
    const chatId = sortedIds.join('_');

    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const snap = await getDoc(chatRef);

    if (!snap.exists()) {
        await setDoc(chatRef, {
            participants: sortedIds,
            type: 'direct',
            createdAt: new Date().toISOString(),
            lastMessage: '',
            lastMessageTime: null
        });
    }

    return chatId;
};

/* ================= SEND MESSAGE ================= */

export const sendMessage = async (chatId, senderId, text = '', file = null) => {
    if (!chatId || !senderId) {
        throw new Error('Missing chatId or senderId');
    }

    // Normalize file object
    const normalizedFile =
        file && file.url
            ? {
                  url: file.url,
                  type: file.type || '',
                  name: file.name || 'attachment'
              }
            : null;

    const messageData = {
        senderId,
        text: text || '',
        file: normalizedFile,
        createdAt: new Date().toISOString()
    };

    // 1️⃣ Save message
    await addDoc(
        collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
        messageData
    );

    // 2️⃣ Update chat preview
    await setDoc(
        doc(db, CHATS_COLLECTION, chatId),
        {
            lastMessage: text
                ? text
                : normalizedFile
                ? 'Sent an attachment'
                : '',
            lastMessageTime: new Date().toISOString()
        },
        { merge: true }
    );

    return true;
};

/* ================= SUBSCRIBE TO MESSAGES ================= */

export const subscribeToMessages = (chatId, callback) => {
    if (!chatId) return () => {};

    const q = query(
        collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, snapshot => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
};

/* ================= SEARCH USERS ================= */

export const searchUsers = async (searchTerm = '') => {
    const q = query(collection(db, USERS_COLLECTION), limit(50));
    const snapshot = await getDocs(q);

    const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    }));

    if (!searchTerm) return users;

    const lower = searchTerm.toLowerCase();
    return users.filter(
        u =>
            (u.name && u.name.toLowerCase().includes(lower)) ||
            (u.email && u.email.toLowerCase().includes(lower))
    );
};

/* ================= GET USER CHATS ================= */

export const getUserChats = async userId => {
    if (!userId) return [];

    try {
        // Direct chats
        const qDirect = query(
            collection(db, CHATS_COLLECTION),
            where('participants', 'array-contains', userId)
        );

        const snap = await getDocs(qDirect);

        const chats = await Promise.all(
            snap.docs.map(async chatDoc => {
                const chat = chatDoc.data();
                const otherId = chat.participants.find(id => id !== userId);

                let name = 'Chat';
                let photoUrl = '';

                if (otherId) {
                    const userSnap = await getDoc(
                        doc(db, USERS_COLLECTION, otherId)
                    );
                    if (userSnap.exists()) {
                        name = userSnap.data().name || name;
                        photoUrl = userSnap.data().photoUrl || '';
                    }
                }

                return {
                    id: chatDoc.id,
                    name,
                    photoUrl,
                    isGroup: chat.type === 'group',
                    lastMessage: chat.lastMessage || '',
                    lastMessageTime: chat.lastMessageTime || null
                };
            })
        );

        return chats.sort((a, b) => {
            const tA = a.lastMessageTime
                ? new Date(a.lastMessageTime)
                : new Date(0);
            const tB = b.lastMessageTime
                ? new Date(b.lastMessageTime)
                : new Date(0);
            return tB - tA;
        });
    } catch (err) {
        console.error('Get user chats error:', err);
        return [];
    }
};
