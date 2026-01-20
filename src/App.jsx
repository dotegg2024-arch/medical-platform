import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Messages from './pages/Messages';
import HealthRecords from './pages/HealthRecords';
import Appointments from './pages/Appointments';
import RehabMenu from './pages/RehabMenu';
import PatientDetail from './pages/PatientDetail';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="avatar avatar-lg mb-4" style={{ margin: '0 auto' }}>
                        <span style={{ animation: 'pulse 2s infinite' }}>MC</span>
                    </div>
                    <p className="text-muted">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <DataProvider>{children}</DataProvider>;
}

function App() {
    const { isPatient, isStaff } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        {isPatient ? <PatientDashboard /> : <StaffDashboard />}
                    </ProtectedRoute>
                }
            />
            <Route
                path="/messages"
                element={
                    <ProtectedRoute>
                        <Messages />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/messages/:partnerId"
                element={
                    <ProtectedRoute>
                        <Messages />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/health"
                element={
                    <ProtectedRoute>
                        <HealthRecords />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/appointments"
                element={
                    <ProtectedRoute>
                        <Appointments />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/rehab"
                element={
                    <ProtectedRoute>
                        <RehabMenu />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/patient/:patientId"
                element={
                    <ProtectedRoute>
                        <PatientDetail />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
