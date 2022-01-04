import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Error404Page from './pages/Error404Page'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignUpPage'
import SigninPage from './pages/SignInPage'
import UploadPage from './pages/UploadPage';
import Header from './components/Header'
import ViewPost from './pages/ViewPost';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Header></Header>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />

          <Route exact path="/signin" element={<SigninPage />} />
          <Route exact path="/signup" element={<SignupPage />} />
          <Route exact path="/newpost" element={<UploadPage />} />
          <Route exact path="/post/:id" element={<ViewPost />} />

          {/* 404 page */}
          <Route path="*" element={<Error404Page />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);