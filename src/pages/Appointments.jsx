import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function Appointments() {
    const { user, isPatient, isStaff, getTeamMembers, getPatients } = useAuth();
    const { getAppointments, addAppointment, updateAppointment } = useData();

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        staffId: '',
        date: '',
        time: '',
        type: '定期診察',
        notes: '',
    });

    const appointments = getAppointments();
    const contacts = isPatient ? getTeamMembers() : getPatients();

    const handleSubmit = (e) => {
        e.preventDefault();
        addAppointment({
            patientId: isPatient ? user.id : formData.patientId,
            staffId: isPatient ? formData.staffId : user.id,
            date: formData.date,
            time: formData.time,
            type: formData.type,
            notes: formData.notes,
        });
        setFormData({ patientId: '', staffId: '', date: '', time: '', type: '定期診察', notes: '' });
        setShowForm(false);
    };

    const handleStatusChange = (id, status) => {
        updateAppointment(id, { status });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            scheduled: { label: '予定', class: 'primary' },
            completed: { label: '完了', class: 'success' },
            cancelled: { label: 'キャンセル', class: 'error' },
        };
        return statusMap[status] || statusMap.scheduled;
    };

    const getContactName = (appointment) => {
        if (isPatient) {
            const staff = contacts.find(c => c.id === appointment.staffId);
            return staff?.name || '不明';
        } else {
            const patient = contacts.find(c => c.id === appointment.patientId);
            return patient?.name || '不明';
        }
    };

    const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
    const pastAppointments = appointments.filter(a => a.status !== 'scheduled');

    return (
        <Layout>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">予約管理</h1>
                    <p className="page-subtitle">診察やリハビリの予約を確認・管理できます</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    新規予約
                </button>
            </div>

            {showForm && (
                <div className="card mb-6 slide-up">
                    <div className="card-header">
                        <h3 className="card-title">予約を作成</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="appointment-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">{isPatient ? '担当者' : '患者'}</label>
                                <select
                                    className="input"
                                    value={isPatient ? formData.staffId : formData.patientId}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [isPatient ? 'staffId' : 'patientId']: e.target.value
                                    })}
                                    required
                                >
                                    <option value="">選択してください</option>
                                    {contacts.map(contact => (
                                        <option key={contact.id} value={contact.id}>{contact.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">種類</label>
                                <select
                                    className="input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="定期診察">定期診察</option>
                                    <option value="リハビリ">リハビリ</option>
                                    <option value="検査">検査</option>
                                    <option value="相談">相談</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">日付</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">時間</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">備考</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="任意のメモ"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                キャンセル
                            </button>
                            <button type="submit" className="btn btn-primary">
                                予約を作成
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 今後の予約 */}
            <section className="mb-6">
                <h2 className="section-title">今後の予約</h2>
                {upcomingAppointments.length > 0 ? (
                    <div className="appointments-grid">
                        {upcomingAppointments.map((apt) => {
                            const status = getStatusBadge(apt.status);
                            return (
                                <div key={apt.id} className="appointment-card card">
                                    <div className="appointment-header">
                                        <span className={`badge badge-${status.class}`}>{status.label}</span>
                                        <span className="appointment-type">{apt.type}</span>
                                    </div>

                                    <div className="appointment-datetime">
                                        <div className="datetime-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            {formatDate(apt.date)}
                                        </div>
                                        <div className="datetime-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {apt.time}
                                        </div>
                                    </div>

                                    <div className="appointment-contact">
                                        <div className="avatar avatar-sm">{getContactName(apt).charAt(0)}</div>
                                        <span>{getContactName(apt)}</span>
                                    </div>

                                    {apt.notes && (
                                        <div className="appointment-notes">{apt.notes}</div>
                                    )}

                                    {isStaff && (
                                        <div className="appointment-actions">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleStatusChange(apt.id, 'completed')}
                                            >
                                                完了にする
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state card">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p>予約はありません</p>
                    </div>
                )}
            </section>

            {/* 過去の予約 */}
            {pastAppointments.length > 0 && (
                <section>
                    <h2 className="section-title">過去の予約</h2>
                    <div className="appointments-grid">
                        {pastAppointments.map((apt) => {
                            const status = getStatusBadge(apt.status);
                            return (
                                <div key={apt.id} className="appointment-card card past">
                                    <div className="appointment-header">
                                        <span className={`badge badge-${status.class}`}>{status.label}</span>
                                        <span className="appointment-type">{apt.type}</span>
                                    </div>

                                    <div className="appointment-datetime">
                                        <div className="datetime-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            {formatDate(apt.date)}
                                        </div>
                                        <div className="datetime-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {apt.time}
                                        </div>
                                    </div>

                                    <div className="appointment-contact">
                                        <div className="avatar avatar-sm">{getContactName(apt).charAt(0)}</div>
                                        <span>{getContactName(apt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <style>{`
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--neutral-100);
        }

        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .appointment-card {
          padding: 1.25rem;
        }

        .appointment-card.past {
          opacity: 0.7;
        }

        .appointment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .appointment-type {
          font-weight: 500;
          color: var(--text-primary);
        }

        .appointment-datetime {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--neutral-100);
        }

        .datetime-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .appointment-contact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .appointment-notes {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: var(--neutral-50);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .appointment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--neutral-100);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-state svg {
          color: var(--neutral-300);
          margin-bottom: 1rem;
        }
      `}</style>
        </Layout>
    );
}

export default Appointments;
