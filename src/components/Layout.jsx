import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
    const { user, logout, isPatient } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const patientMenuItems = [
        { path: '/', label: 'ダッシュボード', icon: 'home' },
        { path: '/messages', label: 'メッセージ', icon: 'message' },
        { path: '/health', label: '健康記録', icon: 'heart' },
        { path: '/appointments', label: '予約', icon: 'calendar' },
        { path: '/rehab', label: 'リハビリ', icon: 'activity' },
    ];

    const staffMenuItems = [
        { path: '/', label: 'ダッシュボード', icon: 'home' },
        { path: '/messages', label: 'メッセージ', icon: 'message' },
        { path: '/appointments', label: '予約管理', icon: 'calendar' },
    ];

    const menuItems = isPatient ? patientMenuItems : staffMenuItems;

    const getIcon = (icon) => {
        const icons = {
            home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
            message: (
                <>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </>
            ),
            heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
            calendar: (
                <>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </>
            ),
            activity: <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />,
        };
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icons[icon]}
            </svg>
        );
    };

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <span>MediConnect</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {getIcon(item.icon)}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role">{isPatient ? '患者' : user?.role}</div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                        ログアウト
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>

            <style>{`
        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--neutral-100);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9375rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .sidebar-footer .btn {
          width: 100%;
        }
      `}</style>
        </div>
    );
}

export default Layout;
