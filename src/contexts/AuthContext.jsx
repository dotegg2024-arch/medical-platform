import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// デモ用ユーザーデータ
const DEMO_USERS = {
    patients: [
        {
            id: 'p1',
            email: 'tanaka@demo.com',
            password: 'demo123',
            name: '田中 太郎',
            type: 'patient',
            dateOfBirth: '1965-03-15',
            bloodType: 'A',
            team: ['s1', 's2'],
        },
        {
            id: 'p2',
            email: 'suzuki@demo.com',
            password: 'demo123',
            name: '鈴木 花子',
            type: 'patient',
            dateOfBirth: '1978-08-22',
            bloodType: 'O',
            team: ['s1'],
        },
    ],
    staff: [
        {
            id: 's1',
            email: 'yamada@hospital.com',
            password: 'staff123',
            name: '山田 医師',
            type: 'staff',
            role: '主治医',
            department: '内科',
            patients: ['p1', 'p2'],
        },
        {
            id: 's2',
            email: 'sato@hospital.com',
            password: 'staff123',
            name: '佐藤 リハビリ士',
            type: 'staff',
            role: '理学療法士',
            department: 'リハビリテーション科',
            patients: ['p1'],
        },
    ],
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ローカルストレージから認証状態を復元
        const savedUser = localStorage.getItem('mediconnect_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // 患者を検索
        const patient = DEMO_USERS.patients.find(
            (p) => p.email === email && p.password === password
        );
        if (patient) {
            const userData = { ...patient };
            delete userData.password;
            setUser(userData);
            localStorage.setItem('mediconnect_user', JSON.stringify(userData));
            return { success: true, user: userData };
        }

        // スタッフを検索
        const staff = DEMO_USERS.staff.find(
            (s) => s.email === email && s.password === password
        );
        if (staff) {
            const userData = { ...staff };
            delete userData.password;
            setUser(userData);
            localStorage.setItem('mediconnect_user', JSON.stringify(userData));
            return { success: true, user: userData };
        }

        return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mediconnect_user');
    };

    const getPatients = () => {
        if (!user || user.type !== 'staff') return [];
        return DEMO_USERS.patients.filter((p) => user.patients.includes(p.id));
    };

    const getTeamMembers = () => {
        if (!user || user.type !== 'patient') return [];
        return DEMO_USERS.staff.filter((s) => user.team.includes(s.id));
    };

    const getAllPatients = () => DEMO_USERS.patients;
    const getAllStaff = () => DEMO_USERS.staff;

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isPatient: user?.type === 'patient',
        isStaff: user?.type === 'staff',
        getPatients,
        getTeamMembers,
        getAllPatients,
        getAllStaff,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
