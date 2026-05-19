import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './modules/landing/pages/LandingPage';
import Login from './modules/user/pages/Login';
import Register from './modules/user/pages/Register';
import PrivateRoute from "./components/PrivateRoute";
import ProjectFormPage from "./modules/project/pages/ProjectFormPage";
import {ProjectDetailPage} from "./modules/project/pages/ProjectDetailPage";
import ProjectsPage from "./modules/project/pages/ProjectsPage";
import NewsPage from './pages/NewsPage';
import ProfilePage from './modules/user/pages/ProfilePage';

const App = () => (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" />} />

                {/* Приватные роуты */}
                <Route element={<PrivateRoute />}>
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/users/me" element={<ProfilePage />} />
                    <Route path="/projects/create" element={<ProjectFormPage />} />
                    <Route path="/project/:id" element={<ProjectDetailPage />} />

                    {/* Добавляй сюда любые защищённые маршруты */}
                </Route>


            </Routes>
        </BrowserRouter>
);

export default App;
