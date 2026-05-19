import React from 'react';
import { useAuth } from '../../../auth/AuthContext'; // или zustand/store
import Header from '../../landing/components/header/Header';

// Моки (потом заменим на fetch с бекенда)
const mockProjects = [
    { id: 1, name: 'DevHub Platform', description: 'Платформа для командной разработки', owner: 'nikita' },
    { id: 2, name: 'IndieGame', description: 'Тестовый геймдев проект', owner: 'student42' },
];

const Projects: React.FC = () => {
    const { user } = useAuth();

    // Если пользователь не авторизован — заглушка
    if (!user) {
        return (
            <>
                <Header />
                <div style={{ maxWidth: 420, margin: '60px auto', textAlign: 'center', color: '#72809e' }}>
                    <h2>Просмотр проектов доступен только авторизованным пользователям</h2>
                    <p>Пожалуйста, войдите или зарегистрируйтесь</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div style={{ maxWidth: 880, margin: '40px auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 700, fontSize: 32, color: '#fff' }}>Проекты</h1>
                    <button
                        style={{
                            padding: '10px 24px',
                            background: '#228bf3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(34,139,243,0.09)'
                        }}
                    >
                        + Создать проект
                    </button>
                </div>
                <div style={{ display: 'grid', gap: 24 }}>
                    {mockProjects.map(project => (
                        <div key={project.id} style={{
                            background: 'rgba(32,34,50,0.92)',
                            borderRadius: 20,
                            boxShadow: '0 2px 12px rgba(40,54,100,0.08)',
                            padding: 28,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}>
                            <span style={{ fontWeight: 700, fontSize: 22 }}>{project.name}</span>
                            <span style={{ fontSize: 15, color: '#c3d0e7' }}>{project.description}</span>
                            <span style={{ fontSize: 14, color: '#5f73a2', marginTop: 10 }}>
                                Владелец: <b>{project.owner}</b>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Projects;
