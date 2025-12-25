import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Minimize2, Trash2, MoreVertical } from 'lucide-react';
import api from '../lib/api';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chatbot_messages');
        return saved ? JSON.parse(saved) : [
            { id: 1, text: "Hi! 👋 I'm your AI Assistant. How can I help you today?", sender: 'ai' }
        ];
    });
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chatbot_messages', JSON.stringify(messages));
        scrollToBottom();
    }, [messages, isOpen]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add User Message
        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setLoading(true);

        // Keep focus on input
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        try {
            const response = await api.post('/chat/message', { message: userMsg.text });
            const aiResponseText = response.data.reply;

            const aiMsg = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat error", error);
            const errorMsg = { id: Date.now() + 1, text: "Sorry, connection failed. Please check your internet or try again later.", sender: 'ai', isError: true };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        if (window.confirm("Clear all chat history?")) {
            const clearMsg = { id: Date.now(), text: "Chat cleared. How can I help now?", sender: 'ai' };
            setMessages([clearMsg]);
            localStorage.setItem('chatbot_messages', JSON.stringify([clearMsg]));
        }
    };

    const handleDeleteMessage = (msgId) => {
        setMessages(prev => prev.filter(msg => msg.id !== msgId));
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="chatbot-trigger"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <MessageCircle size={32} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '330px',
            height: isMinimized ? '70px' : '480px',
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            border: '1px solid rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            fontFamily: 'var(--font-sans)'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                        <MessageCircle size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>AI Assistant</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', opacity: 0.9 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                            Online
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={handleClearChat} className="header-btn" title="Clear Chat">
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="header-btn"
                        title="Minimize"
                    >
                        <Minimize2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="header-btn"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="messages-container" style={{
                        flex: 1,
                        padding: '1.25rem',
                        overflowY: 'auto',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="message-wrapper"
                                style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    position: 'relative'
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: '1.25rem',
                                        borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '1.25rem',
                                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '1.25rem',
                                        backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#1e293b', // FIXED CONTRAST
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        position: 'relative',
                                        border: msg.sender === 'ai' ? '1px solid rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    {msg.text}
                                </div>

                                {/* Delete Message Action (Visible on Hover) */}
                                <button
                                    className="msg-delete-btn"
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    title="Delete message"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', marginLeft: '0.5rem' }}>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: '1rem',
                            borderTop: '1px solid var(--color-border)',
                            backgroundColor: 'white',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center'
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about products, orders..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '0.875rem 1rem',
                                borderRadius: '9999px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: '#f8fafc',
                                color: '#0f172a'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <button
                            type="submit"
                            disabled={loading || !inputValue.trim()}
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                opacity: (loading || !inputValue.trim()) ? 0.6 : 1,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            {loading ? <Loader size={20} className="spin" /> : <Send size={20} style={{ marginLeft: '2px' }} />}
                        </button>
                    </form>
                </>
            )}

            <style>{`
                .header-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 8px;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .header-btn:hover { background: rgba(255,255,255,0.2); }
                
                .message-wrapper:hover .msg-delete-btn { opacity: 1; visibility: visible; }
                
                .msg-delete-btn {
                    position: absolute;
                    top: -6px;
                    opacity: 0;
                    visibility: hidden;
                    background: #cbd5e1;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .msg-delete-btn:hover { background: var(--color-danger); }
                /* Position delete btn based on sender */
                .message-wrapper:has(> [style*="background-color: white"]) .msg-delete-btn { right: -10px; }
                .message-wrapper:has(> [style*="var(--color-primary)"]) .msg-delete-btn { left: -10px; }

                .chatbot-trigger:hover { transform: scale(1.05) translateY(-2px); }

                /* Typing Indicator */
                .typing-indicator span {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background-color: #94a3b8;
                    border-radius: 50%;
                    margin-right: 4px;
                    animation: typing 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default ChatbotWidget;
