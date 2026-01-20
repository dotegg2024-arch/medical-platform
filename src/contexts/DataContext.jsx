import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// 初期データ
const INITIAL_DATA = {
    messages: [
        {
            id: 'm1',
            senderId: 's1',
            receiverId: 'p1',
            content: '田中さん、本日の診察ありがとうございました。血圧が少し高めでしたので、引き続き食事に気をつけてください。',
            timestamp: '2026-01-15T10:30:00',
            read: true,
        },
        {
            id: 'm2',
            senderId: 'p1',
            receiverId: 's1',
            content: '山田先生、ありがとうございます。塩分控えめに気をつけます。',
            timestamp: '2026-01-15T11:00:00',
            read: true,
        },
        {
            id: 'm3',
            senderId: 's2',
            receiverId: 'p1',
            content: 'リハビリのメニューを更新しました。無理のない範囲で続けてください。',
            timestamp: '2026-01-15T14:00:00',
            read: false,
        },
    ],
    healthRecords: [
        {
            id: 'h1',
            patientId: 'p1',
            date: '2026-01-16',
            bloodPressureHigh: 138,
            bloodPressureLow: 85,
            pulse: 72,
            temperature: 36.4,
            weight: 68.5,
            notes: '朝食後に計測',
        },
        {
            id: 'h2',
            patientId: 'p1',
            date: '2026-01-15',
            bloodPressureHigh: 142,
            bloodPressureLow: 88,
            pulse: 75,
            temperature: 36.5,
            weight: 68.3,
            notes: '',
        },
        {
            id: 'h3',
            patientId: 'p1',
            date: '2026-01-14',
            bloodPressureHigh: 135,
            bloodPressureLow: 82,
            pulse: 70,
            temperature: 36.3,
            weight: 68.7,
            notes: '散歩後に計測',
        },
    ],
    appointments: [
        {
            id: 'a1',
            patientId: 'p1',
            staffId: 's1',
            date: '2026-01-20',
            time: '10:00',
            type: '定期診察',
            status: 'scheduled',
            notes: '血液検査あり',
        },
        {
            id: 'a2',
            patientId: 'p1',
            staffId: 's2',
            date: '2026-01-18',
            time: '14:00',
            type: 'リハビリ',
            status: 'scheduled',
            notes: '',
        },
        {
            id: 'a3',
            patientId: 'p2',
            staffId: 's1',
            date: '2026-01-17',
            time: '11:00',
            type: '定期診察',
            status: 'scheduled',
            notes: '',
        },
    ],
    rehabMenus: [
        {
            id: 'r1',
            patientId: 'p1',
            name: '膝関節ストレッチ',
            description: '座った状態で膝を伸ばし、つま先を手前に引きます。20秒キープ。',
            frequency: '1日3回',
            duration: '各20秒 × 3セット',
            status: 'active',
            progress: [
                { date: '2026-01-15', completed: true, notes: '' },
                { date: '2026-01-14', completed: true, notes: '少し痛みあり' },
                { date: '2026-01-13', completed: false, notes: '' },
            ],
        },
        {
            id: 'r2',
            patientId: 'p1',
            name: 'ウォーキング',
            description: '平坦な道を自分のペースで歩きます。息が切れない程度に。',
            frequency: '1日1回',
            duration: '15〜20分',
            status: 'active',
            progress: [
                { date: '2026-01-15', completed: true, notes: '近所を一周' },
                { date: '2026-01-14', completed: true, notes: '' },
                { date: '2026-01-13', completed: true, notes: '' },
            ],
        },
        {
            id: 'r3',
            patientId: 'p1',
            name: '腕の挙上運動',
            description: '両腕をゆっくり上に上げ、5秒キープしてからゆっくり下ろします。',
            frequency: '1日2回',
            duration: '10回 × 2セット',
            status: 'active',
            progress: [],
        },
    ],
};

export function DataProvider({ children }) {
    const { user } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        // ローカルストレージからデータを読み込む
        const savedData = localStorage.getItem('mediconnect_data');
        if (savedData) {
            setData(JSON.parse(savedData));
        } else {
            setData(INITIAL_DATA);
            localStorage.setItem('mediconnect_data', JSON.stringify(INITIAL_DATA));
        }
    }, []);

    const saveData = (newData) => {
        setData(newData);
        localStorage.setItem('mediconnect_data', JSON.stringify(newData));
    };

    // メッセージ関連
    const getMessages = (partnerId) => {
        if (!data || !user) return [];
        return data.messages.filter(
            (m) =>
                (m.senderId === user.id && m.receiverId === partnerId) ||
                (m.senderId === partnerId && m.receiverId === user.id)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    const sendMessage = (receiverId, content) => {
        const newMessage = {
            id: `m${Date.now()}`,
            senderId: user.id,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
            read: false,
        };
        const newData = {
            ...data,
            messages: [...data.messages, newMessage],
        };
        saveData(newData);
        return newMessage;
    };

    const getUnreadCount = (partnerId) => {
        if (!data || !user) return 0;
        return data.messages.filter(
            (m) => m.senderId === partnerId && m.receiverId === user.id && !m.read
        ).length;
    };

    // 健康記録関連
    const getHealthRecords = (patientId) => {
        if (!data) return [];
        const targetId = patientId || user?.id;
        return data.healthRecords
            .filter((r) => r.patientId === targetId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const addHealthRecord = (record) => {
        const newRecord = {
            ...record,
            id: `h${Date.now()}`,
            patientId: user.id,
        };
        const newData = {
            ...data,
            healthRecords: [...data.healthRecords, newRecord],
        };
        saveData(newData);
        return newRecord;
    };

    // 予約関連
    const getAppointments = (id) => {
        if (!data || !user) return [];
        const targetId = id || user.id;
        const isPatient = user.type === 'patient';
        return data.appointments
            .filter((a) => (isPatient ? a.patientId === targetId : a.staffId === targetId || a.patientId === targetId))
            .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    };

    const addAppointment = (appointment) => {
        const newAppointment = {
            ...appointment,
            id: `a${Date.now()}`,
            status: 'scheduled',
        };
        const newData = {
            ...data,
            appointments: [...data.appointments, newAppointment],
        };
        saveData(newData);
        return newAppointment;
    };

    const updateAppointment = (id, updates) => {
        const newData = {
            ...data,
            appointments: data.appointments.map((a) =>
                a.id === id ? { ...a, ...updates } : a
            ),
        };
        saveData(newData);
    };

    // リハビリメニュー関連
    const getRehabMenus = (patientId) => {
        if (!data) return [];
        const targetId = patientId || user?.id;
        return data.rehabMenus.filter((r) => r.patientId === targetId);
    };

    const addRehabMenu = (menu) => {
        const newMenu = {
            ...menu,
            id: `r${Date.now()}`,
            status: 'active',
            progress: [],
        };
        const newData = {
            ...data,
            rehabMenus: [...data.rehabMenus, newMenu],
        };
        saveData(newData);
        return newMenu;
    };

    const updateRehabProgress = (menuId, date, completed, notes = '') => {
        const newData = {
            ...data,
            rehabMenus: data.rehabMenus.map((menu) => {
                if (menu.id !== menuId) return menu;
                const existingIndex = menu.progress.findIndex((p) => p.date === date);
                const progressEntry = { date, completed, notes };
                const newProgress = existingIndex >= 0
                    ? menu.progress.map((p, i) => (i === existingIndex ? progressEntry : p))
                    : [...menu.progress, progressEntry];
                return { ...menu, progress: newProgress };
            }),
        };
        saveData(newData);
    };

    const value = {
        data,
        getMessages,
        sendMessage,
        getUnreadCount,
        getHealthRecords,
        addHealthRecord,
        getAppointments,
        addAppointment,
        updateAppointment,
        getRehabMenus,
        addRehabMenu,
        updateRehabProgress,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
