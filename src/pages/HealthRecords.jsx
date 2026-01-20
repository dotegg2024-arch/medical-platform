import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

function HealthRecords() {
    const { user, isPatient } = useAuth();
    const { getHealthRecords, addHealthRecord } = useData();

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        bloodPressureHigh: '',
        bloodPressureLow: '',
        pulse: '',
        temperature: '',
        weight: '',
        notes: '',
    });

    const healthRecords = getHealthRecords();

    const handleSubmit = (e) => {
        e.preventDefault();
        addHealthRecord({
            ...formData,
            bloodPressureHigh: Number(formData.bloodPressureHigh),
            bloodPressureLow: Number(formData.bloodPressureLow),
            pulse: Number(formData.pulse),
            temperature: Number(formData.temperature),
            weight: Number(formData.weight),
        });
        setFormData({
            date: new Date().toISOString().split('T')[0],
            bloodPressureHigh: '',
            bloodPressureLow: '',
            pulse: '',
            temperature: '',
            weight: '',
            notes: '',
        });
        setShowForm(false);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    };

    const getBloodPressureStatus = (high, low) => {
        if (high >= 140 || low >= 90) return { label: '高め', class: 'warning' };
        if (high <= 90 || low <= 60) return { label: '低め', class: 'info' };
        return { label: '正常', class: 'success' };
    };

    return (
        <Layout>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">健康記録</h1>
                    <p className="page-subtitle">日々のバイタルサインを記録・確認できます</p>
                </div>
                {isPatient && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        新規記録
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-6 slide-up">
                    <div className="card-header">
                        <h3 className="card-title">健康データを記録</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="health-form">
                        <div className="form-grid">
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
                                <label className="input-label">血圧（上）</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="例: 120"
                                    value={formData.bloodPressureHigh}
                                    onChange={(e) => setFormData({ ...formData, bloodPressureHigh: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">血圧（下）</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="例: 80"
                                    value={formData.bloodPressureLow}
                                    onChange={(e) => setFormData({ ...formData, bloodPressureLow: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">脈拍 (bpm)</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="例: 72"
                                    value={formData.pulse}
                                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">体温 (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input"
                                    placeholder="例: 36.5"
                                    value={formData.temperature}
                                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">体重 (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input"
                                    placeholder="例: 65.0"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">メモ</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="任意のメモ（例: 朝食前に計測）"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                キャンセル
                            </button>
                            <button type="submit" className="btn btn-primary">
                                記録を保存
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="records-grid">
                {healthRecords.length > 0 ? (
                    healthRecords.map((record) => {
                        const bpStatus = getBloodPressureStatus(record.bloodPressureHigh, record.bloodPressureLow);
                        return (
                            <div key={record.id} className="record-card card">
                                <div className="record-date">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {formatDate(record.date)}
                                </div>

                                <div className="vital-grid">
                                    <div className="vital-item">
                                        <div className="vital-icon blood-pressure">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </div>
                                        <div className="vital-data">
                                            <span className="vital-label">血圧</span>
                                            <span className="vital-value">{record.bloodPressureHigh}/{record.bloodPressureLow}</span>
                                            <span className="vital-unit">mmHg</span>
                                        </div>
                                        <span className={`badge badge-${bpStatus.class}`}>{bpStatus.label}</span>
                                    </div>

                                    <div className="vital-item">
                                        <div className="vital-icon pulse">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                                            </svg>
                                        </div>
                                        <div className="vital-data">
                                            <span className="vital-label">脈拍</span>
                                            <span className="vital-value">{record.pulse}</span>
                                            <span className="vital-unit">bpm</span>
                                        </div>
                                    </div>

                                    <div className="vital-item">
                                        <div className="vital-icon temperature">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <path d="M14 14.76V3.5a2.5 2.5 0 1 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                                            </svg>
                                        </div>
                                        <div className="vital-data">
                                            <span className="vital-label">体温</span>
                                            <span className="vital-value">{record.temperature}</span>
                                            <span className="vital-unit">°C</span>
                                        </div>
                                    </div>

                                    <div className="vital-item">
                                        <div className="vital-icon weight">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="12" x2="15" y2="15" />
                                            </svg>
                                        </div>
                                        <div className="vital-data">
                                            <span className="vital-label">体重</span>
                                            <span className="vital-value">{record.weight}</span>
                                            <span className="vital-unit">kg</span>
                                        </div>
                                    </div>
                                </div>

                                {record.notes && (
                                    <div className="record-notes">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                        {record.notes}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state card">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <p>まだ記録がありません</p>
                        <p className="text-sm text-muted">「新規記録」ボタンから健康データを追加しましょう</p>
                    </div>
                )}
            </div>

            <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

        .records-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        .record-card {
          padding: 1.25rem;
        }

        .record-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--neutral-100);
        }

        .vital-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .vital-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
        }

        .vital-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vital-icon.blood-pressure {
          background: #fee2e2;
          color: #dc2626;
        }

        .vital-icon.pulse {
          background: #dbeafe;
          color: #2563eb;
        }

        .vital-icon.temperature {
          background: #fef3c7;
          color: #d97706;
        }

        .vital-icon.weight {
          background: #dcfce7;
          color: #16a34a;
        }

        .vital-data {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .vital-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .vital-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .vital-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .record-notes {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--neutral-100);
          font-size: 0.875rem;
          color: var(--text-secondary);
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

export default HealthRecords;
