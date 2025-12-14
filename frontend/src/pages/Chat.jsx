import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
    getOrCreateChat,
    subscribeToMessages,
    searchUsers,
    getUserChats,
    sendMessage
} from '../services/chatService';
import { uploadToR2 } from '../services/uploadService';
import { Send, Paperclip, Search, User, FileText, Video, Users } from 'lucide-react';

const Chat = () => {
    const { currentUser } = useAuth();

    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [chats, setChats] = useState([]);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef(null);

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
        if (!currentUser) return;

        const load = async () => {
            const myChats = await getUserChats(currentUser.uid);
            setChats(myChats);

            const allUsers = await searchUsers('');
            setUsers(allUsers.filter(u => u.uid !== currentUser.uid));
        };
        load();
    }, [currentUser]);

    /* ---------------- SEARCH USERS ---------------- */
    useEffect(() => {
        const timer = setTimeout(async () => {
            const results = await searchUsers(searchTerm);
            setUsers(results.filter(u => u.uid !== currentUser.uid));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, currentUser]);

    /* ---------------- LOAD MESSAGES ---------------- */
    useEffect(() => {
        if (!selectedChat) return;

        const unsubscribe = subscribeToMessages(selectedChat.id, msgs => {
            setMessages(msgs);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => unsubscribe();
    }, [selectedChat]);

    /* ---------------- SELECT USER ---------------- */
    const handleUserSelect = async user => {
        const chatId = await getOrCreateChat(currentUser.uid, user.uid);

        const existing = chats.find(c => c.id === chatId);
        const chatData = existing || {
            id: chatId,
            name: user.name,
            photoUrl: user.photoUrl,
            isGroup: false,
            lastMessage: null
        };

        setSelectedChat(chatData);
        if (!existing) setChats(prev => [chatData, ...prev]);
    };

    /* ---------------- SEND MESSAGE ---------------- */
    const handleSend = async e => {
        e.preventDefault();
        if (!selectedChat || (!newMessage.trim() && !selectedFile)) return;

        try {
            let fileData = null;

            if (selectedFile) {
                setUploading(true);
                const uploaded = await uploadToR2(selectedFile, 'chat');

                fileData = {
                    url: uploaded.url,
                    type: selectedFile.type,
                    name: selectedFile.name
                };
            }

            await sendMessage(
                selectedChat.id,
                currentUser.uid,
                newMessage,
                fileData
            );

            setNewMessage('');
            setSelectedFile(null);
        } catch (err) {
            alert('Failed to send message');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-4 gap-4">

                {/* SIDEBAR */}
                <div className="w-80 bg-white rounded-2xl border flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                className="w-full pl-10 py-2 rounded-xl border"
                                placeholder="Search users"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {(searchTerm ? users : chats).map(item => (
                            <div
                                key={item.uid || item.id}
                                onClick={() =>
                                    searchTerm
                                        ? handleUserSelect(item)
                                        : setSelectedChat(item)
                                }
                                className="p-3 hover:bg-gray-100 cursor-pointer"
                            >
                                <div className="font-semibold">
                                    {item.name || 'Chat'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAT AREA */}
                <div className="flex-1 bg-white rounded-2xl border flex flex-col">
                    {selectedChat ? (
                        <>
                            <div className="p-4 border-b font-bold">
                                {selectedChat.name}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isOwn={msg.senderId === currentUser.uid}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                onSubmit={handleSend}
                                className="p-4 border-t flex items-center gap-2"
                            >
                                <label className="cursor-pointer">
                                    <Paperclip />
                                    <input
                                        type="file"
                                        hidden
                                        onChange={e => setSelectedFile(e.target.files[0])}
                                    />
                                </label>

                                <input
                                    className="flex-1 border rounded-full px-4 py-2"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Type a message"
                                />

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-blue-600 text-white p-2 rounded-full"
                                >
                                    <Send />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a chat
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ---------------- MESSAGE BUBBLE ---------------- */
const MessageBubble = ({ message, isOwn }) => {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] p-3 rounded-xl ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
            >
                {message.file?.type.startsWith('image/') && (
                    <img
                        src={message.file.url}
                        alt=""
                        className="rounded-lg mb-2"
                    />
                )}

                {message.file?.type.startsWith('video/') && (
                    <video
                        controls
                        src={message.file.url}
                        className="rounded-lg mb-2"
                    />
                )}

                {message.file &&
                    !message.file.type.startsWith('image/') &&
                    !message.file.type.startsWith('video/') && (
                        <a
                            href={message.file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 underline"
                        >
                            <FileText size={14} />
                            {message.file.name}
                        </a>
                    )}

                {message.text && <p>{message.text}</p>}
            </div>
        </div>
    );
};

export default Chat;
