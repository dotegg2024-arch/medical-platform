import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function Messages() {
    const { partnerId } = useParams();
    const { user, isPatient, getTeamMembers, getPatients, getAllPatients, getAllStaff } = useAuth();
    const { getMessages, sendMessage, getUnreadCount } = useData();

    const [selectedPartner, setSelectedPartner] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const contacts = isPatient ? getTeamMembers() : getPatients();
    const allPatients = getAllPatients();
    const allStaff = getAllStaff();

    const getPersonById = (id) => {
        return allPatients.find(p => p.id === id) || allStaff.find(s => s.id === id);
    };

    useEffect(() => {
        if (partnerId) {
            const partner = getPersonById(partnerId);
            if (partner) setSelectedPartner(partner);
        } else if (contacts.length > 0) {
            setSelectedPartner(contacts[0]);
        }
    }, [partnerId, contacts]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedPartner]);

    const messages = selectedPartner ? getMessages(selectedPartner.id) : [];

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        sendMessage(selectedPartner.id, newMessage.trim());
        setNewMessage('');

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) + ' ' +
            date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Layout>
            <div className="messages-page">
                {/* 連絡先リスト */}
                <div className="contacts-panel">
                    <div className="contacts-header">
                        <h3>メッセージ</h3>
                    </div>
                    <div className="contacts-list">
                        {contacts.map((contact) => {
                            const unread = getUnreadCount(contact.id);
                            const lastMessages = getMessages(contact.id);
                            const lastMessage = lastMessages[lastMessages.length - 1];

                            return (
                                <Link
                                    key={contact.id}
                                    to={`/messages/${contact.id}`}
                                    className={`contact-item ${selectedPartner?.id === contact.id ? 'active' : ''}`}
                                    onClick={() => setSelectedPartner(contact)}
                                >
                                    <div className="avatar">{contact.name.charAt(0)}</div>
                                    <div className="contact-info">
                                        <div className="contact-name">
                                            {contact.name}
                                            {unread > 0 && <span className="unread-badge">{unread}</span>}
                                        </div>
                                        <div className="contact-preview">
                                            {lastMessage ? lastMessage.content.substring(0, 30) + '...' : 'メッセージはありません'}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* チャットエリア */}
                <div className="chat-panel">
                    {selectedPartner ? (
                        <>
                            <div className="chat-header">
                                <div className="avatar">{selectedPartner.name.charAt(0)}</div>
                                <div className="chat-partner-info">
                                    <div className="partner-name">{selectedPartner.name}</div>
                                    <div className="partner-role">
                                        {selectedPartner.type === 'staff'
                                            ? `${selectedPartner.role} - ${selectedPartner.department}`
                                            : '患者'
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="no-messages">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <p>まだメッセージがありません</p>
                                        <p className="text-sm text-muted">最初のメッセージを送信しましょう</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isSent = msg.senderId === user.id;
                                        return (
                                            <div key={msg.id} className={`message ${isSent ? 'sent' : 'received'}`}>
                                                {!isSent && <div className="avatar avatar-sm">{selectedPartner.name.charAt(0)}</div>}
                                                <div className="message-bubble">
                                                    <div className="message-content">{msg.content}</div>
                                                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input" onSubmit={handleSend}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="メッセージを入力..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>連絡先を選択してください</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .messages-page {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 140px);
        }

        .contacts-panel {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .contacts-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--neutral-100);
        }

        .contacts-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .contacts-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem;
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .contact-item:hover {
          background: var(--neutral-50);
        }

        .contact-item.active {
          background: var(--primary-50);
        }

        .contact-info {
          flex: 1;
          min-width: 0;
        }

        .contact-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .unread-badge {
          background: var(--primary-500);
          color: white;
          font-size: 0.6875rem;
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-full);
        }

        .contact-preview {
          font-size: 0.8125rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-panel {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--neutral-100);
        }

        .chat-partner-info {
          flex: 1;
        }

        .partner-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .partner-role {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 0.5rem;
          max-width: 70%;
        }

        .message.sent {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.received {
          align-self: flex-start;
        }

        .message-bubble {
          display: flex;
          flex-direction: column;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .message.received .message-content {
          background: var(--neutral-100);
          color: var(--text-primary);
          border-bottom-left-radius: var(--radius-sm);
        }

        .message.sent .message-content {
          background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
          color: white;
          border-bottom-right-radius: var(--radius-sm);
        }

        .message-time {
          font-size: 0.6875rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          padding: 0 0.25rem;
        }

        .message.sent .message-time {
          text-align: right;
        }

        .chat-input {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--neutral-100);
        }

        .chat-input .input {
          flex: 1;
        }

        .no-messages, .no-chat-selected {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          gap: 0.5rem;
        }

        .no-messages svg, .no-chat-selected svg {
          color: var(--neutral-300);
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .messages-page {
            grid-template-columns: 1fr;
          }

          .contacts-panel {
            display: ${selectedPartner ? 'none' : 'flex'};
          }
        }
      `}</style>
        </Layout>
    );
}

export default Messages;
