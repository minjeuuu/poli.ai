import { ImageWithFallback } from '../atoms/ImageWithFallback';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Search, Edit3, Paperclip, Send, MoreVertical, Archive, Trash2, Phone, Video, Info, Download, Check, CheckCheck, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ChatConversation, ChatMessage } from '../../types';
import { playSFX } from '../../services/soundService';
import { db } from '../../services/database';
import { ChannelList } from '../chat/ChannelList';
import { generateWithFallback } from '../../services/common';
import socket from '../../services/socket';

interface MessageTabProps {
    onNavigate: (type: string, payload: any) => void;
    user?: any;
}

const MessageTab: React.FC<MessageTabProps> = ({ onNavigate, user }) => {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadChats = async () => {
            const res = await db.execute("SELECT * FROM chats");
            if (res.success && res.rows.length > 0) {
                setConversations(res.rows);
            } else {
                const defaultChat: ChatConversation = {
                    id: 'general',
                    participant: { name: 'General Channel', role: 'Public', status: 'Online', avatar: 'GC' },
                    lastMessage: 'Welcome to the general channel!',
                    lastTime: 'Now',
                    unread: 0,
                    archived: false,
                    messages: []
                };
                await db.saveItem('chats', { ...defaultChat, messages: undefined });
                setConversations([defaultChat]);
            }
        };
        loadChats();

        socket.on('receive_message', (msg: any) => {
            if (msg.senderId === user?.id) return; 
            
            setConversations(prev => prev.map(c => {
                if (c.id === msg.chatId) {
                    const newMsgs = [...(c.messages || []), msg];
                    return { ...c, messages: newMsgs, lastMessage: msg.text, lastTime: 'Just now', unread: c.id !== activeChatId ? (c.unread || 0) + 1 : 0 };
                }
                return c;
            }));
            playSFX('message');
        });

        return () => {
            socket.off('receive_message');
        };
    }, [user, activeChatId]);

    // Join Room on Chat Select
    useEffect(() => {
        if (activeChatId) {
            socket.emit('join_chat', activeChatId);
            fetch(`/api/messages/${activeChatId}`)
                .then(res => res.json())
                .then(msgs => {
                     setConversations(prev => prev.map(c => {
                        if (c.id === activeChatId) {
                            return { ...c, messages: msgs };
                        }
                        return c;
                    }));
                });
        }
    }, [activeChatId]);

    const handleSendMessage = async () => {
        if ((!inputText.trim() && !isUploading) || !activeChatId) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            chatId: activeChatId,
            senderId: user?.id || 'guest',
            text: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: [...(c.messages || []), newMessage],
                    lastMessage: inputText,
                    lastTime: 'Just now'
                };
            }
            return c;
        }));

        setInputText('');
        playSFX('send');

        socket.emit('send_message', newMessage);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChatId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            const newMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                chatId: activeChatId,
                senderId: user?.id || 'guest',
                text: `Sent a file: ${data.filename}`,
                attachments: [{
                    type: data.type.startsWith('image') ? 'image' : 'doc',
                    url: data.url,
                    name: data.filename
                }],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };

            socket.emit('send_message', newMessage);
             setConversations(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return {
                        ...c,
                        messages: [...(c.messages || []), newMessage],
                        lastMessage: `Sent a file`,
                        lastTime: 'Just now'
                    };
                }
                return c;
            }));

        } catch (error) {
            console.error("Upload failed", error);
            setToast({ visible: true, message: "Upload failed" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleNewChat = async () => {
        const newId = `c-new-${Date.now()}`;
        const newChat: ChatConversation = {
            id: newId,
            participant: { name: 'New Channel', role: 'Public', status: 'Online', avatar: 'NC' },
            lastMessage: 'Start a new conversation',
            lastTime: 'Now',
            unread: 0,
            archived: false,
            messages: []
        };
        await db.saveItem('chats', { ...newChat, messages: undefined });
        setConversations([newChat, ...conversations]);
        setActiveChatId(newId);
    };

    const activeChat = conversations.find(c => c.id === activeChatId);
    const filteredConversations = conversations.filter(c => !c.archived && c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-full bg-stone-50 dark:bg-black/20">
            {/* Sidebar */}
            <div className={`w-full md:w-80 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                    <h2 className="font-serif font-bold text-xl text-academic-text dark:text-stone-100">Messages</h2>
                    <button onClick={handleNewChat} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-academic-accent">
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input 
                            type="text" 
                            placeholder="Search conversations..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-stone-100 dark:bg-stone-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-academic-accent/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(chat => (
                        <div 
                            key={chat.id}
                            onClick={() => setActiveChatId(chat.id)}
                            className={`p-4 border-b border-stone-100 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${activeChatId === chat.id ? 'bg-academic-bg dark:bg-stone-800' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-lg font-serif font-bold text-stone-500">
                                        {chat.participant.avatar}
                                    </div>
                                    {chat.participant.status === 'Online' && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-stone-900"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-stone-900 dark:text-stone-100 truncate">{chat.participant.name}</h3>
                                        <span className="text-xs text-stone-400 whitespace-nowrap">{chat.lastTime}</span>
                                    </div>
                                    <p className={`text-sm truncate ${chat.unread ? 'font-semibold text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}>
                                        {chat.lastMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {activeChat ? (
                <div className={`flex-1 flex flex-col h-full ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 -ml-2 text-stone-500">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-serif font-bold text-stone-500">
                                {activeChat.participant.avatar}
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900 dark:text-stone-100">{activeChat.participant.name}</h3>
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    {activeChat.participant.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-stone-400">
                            <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"><Phone className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"><Video className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"><Info className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50 dark:bg-black/20">
                        {activeChat.messages?.map((msg, i) => (
                            <div key={msg.id || i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${msg.isMe ? 'order-1' : 'order-2'}`}>
                                    <div className={`p-4 rounded-2xl shadow-sm ${
                                        msg.isMe 
                                            ? 'bg-academic-accent text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none'
                                    }`}>
                                        {msg.attachments && msg.attachments.map((att, idx) => (
                                            <div key={idx} className="mb-2">
                                                {att.type === 'image' ? (
                                                    <ImageWithFallback src={att.url} alt="Attachment" className="rounded-lg max-w-full h-auto" />
                                                ) : (
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/10 p-2 rounded text-sm underline">
                                                        <FileText className="w-4 h-4" /> {att.name}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-stone-400 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span>{msg.timestamp}</span>
                                        {msg.isMe && <CheckCheck className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                        <div className="flex items-end gap-2 max-w-4xl mx-auto">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-stone-400 hover:text-academic-accent hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-2xl p-2 flex items-center gap-2">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm max-h-32 resize-none py-2 px-2"
                                    rows={1}
                                />
                            </div>
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() && !isUploading}
                                className="p-3 bg-academic-accent text-white rounded-full hover:bg-academic-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-stone-400">
                    <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="font-serif text-lg">Select a conversation to start chatting</p>
                </div>
            )}
        </div>
    );
};

export default MessageTab;
