import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function RehabMenu() {
    const { user, isPatient } = useAuth();
    const { getRehabMenus, updateRehabProgress, addRehabMenu } = useData();

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        frequency: '',
        duration: '',
    });

    const rehabMenus = getRehabMenus();
    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        addRehabMenu({
            ...formData,
            patientId: user.id,
        });
        setFormData({ name: '', description: '', frequency: '', duration: '' });
        setShowForm(false);
    };

    const handleToggleProgress = (menuId, completed) => {
        updateRehabProgress(menuId, today, completed);
    };

    const getProgressForDate = (menu, date) => {
        return menu.progress.find(p => p.date === date);
    };

    const getCompletionRate = (menu) => {
        if (menu.progress.length === 0) return 0;
        const completed = menu.progress.filter(p => p.completed).length;
        return Math.round((completed / menu.progress.length) * 100);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();

    return (
        <Layout>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">リハビリメニュー</h1>
                    <p className="page-subtitle">リハビリの計画と進捗を管理できます</p>
                </div>
                {!isPatient && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        メニュー追加
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-6 slide-up">
                    <div className="card-header">
                        <h3 className="card-title">リハビリメニューを追加</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">メニュー名</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="例: 膝関節ストレッチ"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">頻度</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="例: 1日3回"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">時間/回数</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="例: 各20秒 × 3セット"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">説明</label>
                            <textarea
                                className="input"
                                rows="3"
                                placeholder="運動の方法や注意点を記入"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                キャンセル
                            </button>
                            <button type="submit" className="btn btn-primary">
                                追加する
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rehab-grid">
                {rehabMenus.length > 0 ? (
                    rehabMenus.map((menu) => {
                        const todayProgress = getProgressForDate(menu, today);
                        const completionRate = getCompletionRate(menu);

                        return (
                            <div key={menu.id} className="rehab-card card">
                                <div className="rehab-header">
                                    <div className="rehab-title-section">
                                        <h3 className="rehab-title">{menu.name}</h3>
                                        <span className={`badge ${menu.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                            {menu.status === 'active' ? '実施中' : '休止中'}
                                        </span>
                                    </div>
                                    <div className="rehab-meta">
                                        <span className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {menu.frequency}
                                        </span>
                                        <span className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                                            </svg>
                                            {menu.duration}
                                        </span>
                                    </div>
                                </div>

                                <div className="rehab-description">
                                    {menu.description}
                                </div>

                                {/* 進捗カレンダー */}
                                <div className="progress-section">
                                    <div className="progress-header">
                                        <span className="progress-label">過去7日間の実施状況</span>
                                        <span className="progress-rate">{completionRate}%</span>
                                    </div>
                                    <div className="progress-calendar">
                                        {last7Days.map((date) => {
                                            const progress = getProgressForDate(menu, date);
                                            const isToday = date === today;
                                            return (
                                                <div
                                                    key={date}
                                                    className={`progress-day ${progress?.completed ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                                                    onClick={() => isPatient && isToday && handleToggleProgress(menu.id, !progress?.completed)}
                                                    title={formatDate(date)}
                                                >
                                                    <span className="day-label">{formatDate(date).split('/')[1] || formatDate(date)}</span>
                                                    {progress?.completed ? (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    ) : (
                                                        <div className="day-empty" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 今日の記録ボタン（患者のみ） */}
                                {isPatient && (
                                    <div className="today-action">
                                        <button
                                            className={`btn ${todayProgress?.completed ? 'btn-accent' : 'btn-primary'}`}
                                            onClick={() => handleToggleProgress(menu.id, !todayProgress?.completed)}
                                        >
                                            {todayProgress?.completed ? (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    本日完了済み
                                                </>
                                            ) : (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                        <circle cx="12" cy="12" r="10" />
                                                    </svg>
                                                    今日の分を記録
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state card">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                        </svg>
                        <p>リハビリメニューはまだありません</p>
                        <p className="text-sm text-muted">担当の医療従事者がメニューを作成します</p>
                    </div>
                )}
            </div>

            <style>{`
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

        textarea.input {
          resize: vertical;
          min-height: 80px;
        }

        .rehab-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .rehab-card {
          padding: 1.5rem;
        }

        .rehab-header {
          margin-bottom: 1rem;
        }

        .rehab-title-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .rehab-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .rehab-meta {
          display: flex;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .rehab-description {
          padding: 1rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .progress-section {
          margin-bottom: 1rem;
        }

        .progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .progress-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .progress-rate {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary-600);
        }

        .progress-calendar {
          display: flex;
          gap: 0.5rem;
        }

        .progress-day {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem;
          background: var(--neutral-100);
          border-radius: var(--radius-md);
          cursor: default;
          transition: all var(--transition-fast);
        }

        .progress-day.today {
          background: var(--primary-100);
          cursor: pointer;
        }

        .progress-day.today:hover {
          background: var(--primary-200);
        }

        .progress-day.completed {
          background: var(--accent-100);
          color: var(--accent-700);
        }

        .progress-day.completed.today {
          background: var(--accent-200);
        }

        .day-label {
          font-size: 0.6875rem;
          font-weight: 500;
        }

        .day-empty {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px dashed var(--neutral-300);
        }

        .today-action {
          padding-top: 1rem;
          border-top: 1px solid var(--neutral-100);
        }

        .today-action .btn {
          width: 100%;
        }

        .empty-state {
          grid-column: 1 / -1;
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

export default RehabMenu;
