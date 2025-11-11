import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('http://localhost:8288/api/users/login', {
        username,
        password
      });

      const { token, user } = data || {};
      if (token && user && user.id != null) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', String(user.id));   // <-- important
        localStorage.setItem('username', user.username);
        navigate('/profile');                                // <-- go to “my profile”
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input id="username" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input id="password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group show-password">
            <input id="showPassword" type="checkbox"
              checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
            <label htmlFor="showPassword">Show password</label>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <button type="button" className="register-link" onClick={() => navigate('/register')}>
          or Register
        </button>
      </div>
    </div>
  );
};

export default Login;