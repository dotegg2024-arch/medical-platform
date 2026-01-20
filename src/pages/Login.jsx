import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // シミュレーション用の遅延
        await new Promise((resolve) => setTimeout(resolve, 500));

        const result = login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleDemoLogin = (type) => {
        if (type === 'patient') {
            setEmail('tanaka@demo.com');
            setPassword('demo123');
        } else {
            setEmail('yamada@hospital.com');
            setPassword('staff123');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container slide-up">
                <div className="login-header">
                    <div className="login-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        <span>MediConnect</span>
                    </div>
                    <p className="login-subtitle">医療コミュニケーションプラットフォーム</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label className="input-label">メールアドレス</label>
                        <input
                            type="email"
                            className={`input ${error ? 'input-error' : ''}`}
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">パスワード</label>
                        <input
                            type="password"
                            className={`input ${error ? 'input-error' : ''}`}
                            placeholder="パスワードを入力"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%' }}>
                        {isLoading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <div className="demo-section">
                    <p className="demo-title">デモアカウントでお試し</p>
                    <div className="demo-buttons">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleDemoLogin('patient')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            患者としてログイン
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleDemoLogin('staff')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
                                <path d="M12 12v5" />
                                <path d="M8 12h8" />
                            </svg>
                            医療従事者としてログイン
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 50%, #e6fff9 100%);
          padding: 1rem;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          padding: 2.5rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary-600);
          margin-bottom: 0.5rem;
        }

        .login-logo svg {
          width: 40px;
          height: 40px;
          color: var(--accent-500);
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .login-form {
          margin-bottom: 2rem;
        }

        .demo-section {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--neutral-100);
        }

        .demo-title {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .demo-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .demo-buttons .btn {
          width: 100%;
        }
      `}</style>
        </div>
    );
}

export default Login;
