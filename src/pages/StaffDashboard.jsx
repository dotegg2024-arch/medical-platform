import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function StaffDashboard() {
    const { user, getPatients, getAllStaff } = useAuth();
    const { getAppointments, getUnreadCount } = useData();

    const patients = getPatients();
    const appointments = getAppointments();
    const allStaff = getAllStaff();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === todayStr);
    const upcomingAppointments = appointments.filter(a => a.date >= todayStr && a.status === 'scheduled');
    const totalUnread = patients.reduce((sum, patient) => sum + getUnreadCount(patient.id), 0);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
    };

    const getPatientById = (id) => patients.find(p => p.id === id);

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">ダッシュボード</h1>
                <p className="page-subtitle">おはようございます、{user?.name}さん</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="stat-value">{patients.length}</div>
                    <div className="stat-label">担当患者</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon accent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="stat-value">{todayAppointments.length}</div>
                    <div className="stat-label">本日の予約</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="stat-value">{upcomingAppointments.length}</div>
                    <div className="stat-label">今後の予約</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div className="stat-value">{totalUnread}</div>
                    <div className="stat-label">未読メッセージ</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* 担当患者一覧 */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">担当患者</h3>
                    </div>
                    <div className="patient-list">
                        {patients.map((patient) => {
                            const patientTeam = allStaff.filter(s => patient.team.includes(s.id));
                            return (
                                <Link key={patient.id} to={`/patient/${patient.id}`} className="patient-item">
                                    <div className="avatar">{patient.name.charAt(0)}</div>
                                    <div className="patient-info">
                                        <span className="patient-name">{patient.name}</span>
                                        <span className="patient-meta">
                                            {patient.bloodType}型 | チーム: {patientTeam.map(s => s.name.split(' ')[0]).join(', ')}
                                        </span>
                                    </div>
                                    {getUnreadCount(patient.id) > 0 && (
                                        <span className="badge badge-primary">{getUnreadCount(patient.id)}</span>
                                    )}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" className="arrow-icon">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* 今後の予約 */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">今後の予約</h3>
                        <Link to="/appointments" className="btn btn-ghost btn-sm">すべて見る</Link>
                    </div>
                    {upcomingAppointments.length > 0 ? (
                        <div className="appointments-list">
                            {upcomingAppointments.slice(0, 5).map((apt) => {
                                const patient = getPatientById(apt.patientId);
                                return (
                                    <div key={apt.id} className="appointment-item">
                                        <div className="appointment-date">
                                            <span className="date">{formatDate(apt.date)}</span>
                                            <span className="time">{apt.time}</span>
                                        </div>
                                        <div className="appointment-info">
                                            <span className="patient">{patient?.name}</span>
                                            <span className="type">{apt.type}</span>
                                        </div>
                                        <span className="badge badge-primary">{apt.status === 'scheduled' ? '予定' : '完了'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted">予約はありません</p>
                    )}
                </div>
            </div>

            <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .patient-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .patient-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .patient-item:hover {
          background: var(--primary-50);
          transform: translateX(4px);
        }

        .patient-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .patient-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .patient-meta {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .arrow-icon {
          color: var(--text-muted);
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .appointment-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
        }

        .appointment-date {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }

        .appointment-date .date {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .appointment-date .time {
          font-size: 0.8125rem;
          color: var(--primary-600);
        }

        .appointment-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .appointment-info .patient {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .appointment-info .type {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </Layout>
    );
}

export default StaffDashboard;
