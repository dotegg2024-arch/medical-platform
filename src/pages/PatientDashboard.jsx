import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function PatientDashboard() {
    const { user, getTeamMembers } = useAuth();
    const { getHealthRecords, getAppointments, getRehabMenus, getUnreadCount } = useData();

    const teamMembers = getTeamMembers();
    const healthRecords = getHealthRecords();
    const appointments = getAppointments();
    const rehabMenus = getRehabMenus();

    const latestHealth = healthRecords[0];
    const upcomingAppointments = appointments.filter(a => a.status === 'scheduled').slice(0, 3);
    const totalUnread = teamMembers.reduce((sum, member) => sum + getUnreadCount(member.id), 0);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">こんにちは、{user?.name?.split(' ')[0]}さん</h1>
                <p className="page-subtitle">今日も健康管理を頑張りましょう</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div className="stat-value">{totalUnread}</div>
                    <div className="stat-label">未読メッセージ</div>
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
                    <div className="stat-value">{upcomingAppointments.length}</div>
                    <div className="stat-label">今後の予約</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                        </svg>
                    </div>
                    <div className="stat-value">{rehabMenus.filter(r => r.status === 'active').length}</div>
                    <div className="stat-label">リハビリメニュー</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="stat-value">{teamMembers.length}</div>
                    <div className="stat-label">医療チーム</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* 最新の健康データ */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">最新の健康データ</h3>
                        <Link to="/health" className="btn btn-ghost btn-sm">すべて見る</Link>
                    </div>
                    {latestHealth ? (
                        <div className="health-summary">
                            <div className="health-item">
                                <span className="health-label">血圧</span>
                                <span className="health-value">{latestHealth.bloodPressureHigh}/{latestHealth.bloodPressureLow} mmHg</span>
                            </div>
                            <div className="health-item">
                                <span className="health-label">脈拍</span>
                                <span className="health-value">{latestHealth.pulse} bpm</span>
                            </div>
                            <div className="health-item">
                                <span className="health-label">体温</span>
                                <span className="health-value">{latestHealth.temperature} °C</span>
                            </div>
                            <div className="health-item">
                                <span className="health-label">体重</span>
                                <span className="health-value">{latestHealth.weight} kg</span>
                            </div>
                            <p className="text-xs text-muted mt-2">記録日: {formatDate(latestHealth.date)}</p>
                        </div>
                    ) : (
                        <p className="text-muted">まだ記録がありません</p>
                    )}
                </div>

                {/* 今後の予約 */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">今後の予約</h3>
                        <Link to="/appointments" className="btn btn-ghost btn-sm">すべて見る</Link>
                    </div>
                    {upcomingAppointments.length > 0 ? (
                        <div className="appointments-list">
                            {upcomingAppointments.map((apt) => {
                                const staff = teamMembers.find(s => s.id === apt.staffId);
                                return (
                                    <div key={apt.id} className="appointment-item">
                                        <div className="appointment-date">
                                            <span className="date">{formatDate(apt.date)}</span>
                                            <span className="time">{apt.time}</span>
                                        </div>
                                        <div className="appointment-info">
                                            <span className="type">{apt.type}</span>
                                            <span className="staff">{staff?.name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted">予約はありません</p>
                    )}
                </div>

                {/* 医療チーム */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">担当医療チーム</h3>
                        <Link to="/messages" className="btn btn-ghost btn-sm">メッセージ</Link>
                    </div>
                    <div className="team-list">
                        {teamMembers.map((member) => (
                            <Link key={member.id} to={`/messages/${member.id}`} className="team-member">
                                <div className="avatar">{member.name.charAt(0)}</div>
                                <div className="member-info">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-role">{member.role} - {member.department}</span>
                                </div>
                                {getUnreadCount(member.id) > 0 && (
                                    <span className="badge badge-primary">{getUnreadCount(member.id)}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .health-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .health-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .health-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .health-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .appointment-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
        }

        .appointment-date {
          display: flex;
          flex-direction: column;
          min-width: 100px;
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
          display: flex;
          flex-direction: column;
        }

        .appointment-info .type {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .appointment-info .staff {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .team-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .team-member {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .team-member:hover {
          background: var(--primary-50);
        }

        .member-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .member-name {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .member-role {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
      `}</style>
        </Layout>
    );
}

export default PatientDashboard;
