import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function PatientDetail() {
    const { patientId } = useParams();
    const { getAllPatients, getAllStaff } = useAuth();
    const { getHealthRecords, getAppointments, getRehabMenus, getMessages } = useData();

    const allPatients = getAllPatients();
    const allStaff = getAllStaff();
    const patient = allPatients.find(p => p.id === patientId);

    if (!patient) {
        return (
            <Layout>
                <div className="empty-state">
                    <p>患者が見つかりません</p>
                    <Link to="/" className="btn btn-primary">ダッシュボードに戻る</Link>
                </div>
            </Layout>
        );
    }

    const healthRecords = getHealthRecords(patientId);
    const appointments = getAppointments(patientId);
    const rehabMenus = getRehabMenus(patientId);
    const teamMembers = allStaff.filter(s => patient.team.includes(s.id));

    const latestHealth = healthRecords[0];
    const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <Layout>
            <div className="patient-detail">
                {/* 患者情報ヘッダー */}
                <div className="patient-header card">
                    <div className="patient-main-info">
                        <div className="avatar avatar-lg">{patient.name.charAt(0)}</div>
                        <div className="patient-info">
                            <h1 className="patient-name">{patient.name}</h1>
                            <div className="patient-meta">
                                <span>{calculateAge(patient.dateOfBirth)}歳</span>
                                <span>•</span>
                                <span>{patient.bloodType}型</span>
                                <span>•</span>
                                <span>{patient.dateOfBirth}</span>
                            </div>
                        </div>
                    </div>
                    <div className="patient-actions">
                        <Link to={`/messages/${patientId}`} className="btn btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            メッセージ
                        </Link>
                    </div>
                </div>

                <div className="detail-grid">
                    {/* 最新の健康データ */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">最新の健康データ</h3>
                            <span className="text-xs text-muted">
                                {latestHealth ? formatDate(latestHealth.date) : '-'}
                            </span>
                        </div>
                        {latestHealth ? (
                            <div className="health-grid">
                                <div className="health-item">
                                    <span className="health-label">血圧</span>
                                    <span className="health-value">{latestHealth.bloodPressureHigh}/{latestHealth.bloodPressureLow}</span>
                                    <span className="health-unit">mmHg</span>
                                </div>
                                <div className="health-item">
                                    <span className="health-label">脈拍</span>
                                    <span className="health-value">{latestHealth.pulse}</span>
                                    <span className="health-unit">bpm</span>
                                </div>
                                <div className="health-item">
                                    <span className="health-label">体温</span>
                                    <span className="health-value">{latestHealth.temperature}</span>
                                    <span className="health-unit">°C</span>
                                </div>
                                <div className="health-item">
                                    <span className="health-label">体重</span>
                                    <span className="health-value">{latestHealth.weight}</span>
                                    <span className="health-unit">kg</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted">記録なし</p>
                        )}
                    </div>

                    {/* 担当チーム */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">担当チーム</h3>
                        </div>
                        <div className="team-list">
                            {teamMembers.map(member => (
                                <div key={member.id} className="team-member">
                                    <div className="avatar">{member.name.charAt(0)}</div>
                                    <div className="member-info">
                                        <span className="member-name">{member.name}</span>
                                        <span className="member-role">{member.role} - {member.department}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 今後の予約 */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">今後の予約</h3>
                        </div>
                        {upcomingAppointments.length > 0 ? (
                            <div className="appointments-list">
                                {upcomingAppointments.slice(0, 3).map(apt => {
                                    const staff = allStaff.find(s => s.id === apt.staffId);
                                    return (
                                        <div key={apt.id} className="appointment-item">
                                            <div className="apt-date">
                                                <span className="date">{formatDate(apt.date)}</span>
                                                <span className="time">{apt.time}</span>
                                            </div>
                                            <div className="apt-info">
                                                <span className="type">{apt.type}</span>
                                                <span className="staff">{staff?.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted">予約なし</p>
                        )}
                    </div>

                    {/* リハビリメニュー */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">リハビリメニュー</h3>
                        </div>
                        {rehabMenus.length > 0 ? (
                            <div className="rehab-list">
                                {rehabMenus.map(menu => {
                                    const completed = menu.progress.filter(p => p.completed).length;
                                    return (
                                        <div key={menu.id} className="rehab-item">
                                            <div className="rehab-info">
                                                <span className="rehab-name">{menu.name}</span>
                                                <span className="rehab-freq">{menu.frequency}</span>
                                            </div>
                                            <span className="rehab-progress">{completed}回実施</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted">メニューなし</p>
                        )}
                    </div>
                </div>

                {/* 健康記録履歴 */}
                <div className="card mt-6">
                    <div className="card-header">
                        <h3 className="card-title">健康記録履歴</h3>
                    </div>
                    {healthRecords.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>日付</th>
                                        <th>血圧</th>
                                        <th>脈拍</th>
                                        <th>体温</th>
                                        <th>体重</th>
                                        <th>メモ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthRecords.slice(0, 10).map(record => (
                                        <tr key={record.id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>{record.bloodPressureHigh}/{record.bloodPressureLow} mmHg</td>
                                            <td>{record.pulse} bpm</td>
                                            <td>{record.temperature} °C</td>
                                            <td>{record.weight} kg</td>
                                            <td>{record.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted">記録なし</p>
                    )}
                </div>
            </div>

            <style>{`
        .patient-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .patient-main-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .patient-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .patient-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .health-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .health-item {
          display: flex;
          flex-direction: column;
        }

        .health-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .health-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .health-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .team-list, .appointments-list, .rehab-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .team-member, .appointment-item, .rehab-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
        }

        .member-info, .apt-info, .rehab-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .member-name, .rehab-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .member-role, .apt-date .time, .rehab-freq {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .apt-date {
          display: flex;
          flex-direction: column;
          min-width: 80px;
        }

        .apt-date .date {
          font-weight: 500;
          color: var(--text-primary);
        }

        .apt-info .type {
          font-weight: 500;
          color: var(--text-primary);
        }

        .apt-info .staff {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .rehab-progress {
          font-size: 0.8125rem;
          color: var(--primary-600);
          font-weight: 500;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 1rem;
        }
      `}</style>
        </Layout>
    );
}

export default PatientDetail;
