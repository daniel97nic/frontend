import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

import './Profile.css';

function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [prevEmail, setPrevEmail] = useState('');
  const [prevPassword, setPrevPassword] = useState('');
  const [prevName, setPrevName] = useState('');
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [passwordEditMode, setPasswordEditMode] = useState(false);
  const [nameEditMode, setNameEditMode] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState('');

  const history = useNavigate();

  const updateEmail = async () => {
    try {
      getCookie('access_token');
      const token = getCookie('access_token');
      const decodedToken = jwtDecode(token);
      const id = decodedToken._id;

      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,          
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEditEmail = () => {
    setEmailEditMode(true);
    setPrevEmail(email);
  };

  const handleEditPassword = () => {
    setPasswordEditMode(true);
    setPrevPassword(password);
  };

  const handleEditName = () => {
    setNameEditMode(true);
    setPrevName(name);
  };

  const handleCancelEmail = () => {
    setEmailEditMode(false);
    setEmail(prevEmail);
  };

  const handleCancelPassword = () => {
    setPasswordEditMode(false);
    setPassword(prevPassword);
  };

  const handleCancelName = () => {
    setNameEditMode(false);
    setName(prevName);
  };

  const handleSaveEmail = () => {
  setEmailEditMode(false);
  updateEmail();
  };

  const handleSavePassword = () => {
    setPasswordEditMode(false);
  };

  const handleSaveName = () => {
    setNameEditMode(false);
  };

  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  };

  const getUserLoggedIn = async () => {
    try {
      const token = getCookie('access_token');
      const decodedToken = jwtDecode(token);
      const name = decodedToken.name;
      setUserLoggedIn(name);
    } catch (error) {
      console.error('Error during authentication:', error.message); 
    }
  };

  useEffect(() => {
    if (getCookie('access_token')) {
        setIsAuthenticated(true);
        const token = getCookie('access_token');
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);
        getUserLoggedIn();
    }
  });

  const handleSignOut = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
    history('/signin');
  };


  return (
      <div className='ProfilePage'>
        <div>
        <header>
          <h2>Incident Management</h2>
        </header>
        <nav>
          <a href='/'>
            <img className="logo" src="/Logo/1.png" alt="Logo" />
          </a>
          <p>Welcome {userLoggedIn}!</p>
          <ul>
                    <li> <a href="/">Home Page </a></li>
                    <li style={{display: isAuthenticated ? "block" : "none"}}> <a href="/profile">Profile</a> </li>
                    <li  style={{display: isAuthenticated ? "block" : "none"}}> <a href="/ticket">Ticket Management</a></li>
                    <li style={{display: isAuthenticated ? "none" : "block"}}> <a href="/signin">Sign in</a></li>
                        {isAuthenticated && (
                            <button onClick={handleSignOut} className="sign-out-button">
                            Sign Out
                            </button>
                        )}
                </ul>
        </nav>
        <center><h2>YOUR PROFILE</h2></center>
        <center><label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          readOnly={!emailEditMode}
        />
        {!emailEditMode ? (
          <button onClick={handleEditEmail}>Edit</button>
        ) : (
          <div>
            <button onClick={handleSaveEmail}>Save</button>
            <button onClick={handleCancelEmail}>Cancel</button>
          </div>
        )}</center>
      </div>
      <div>
        <center><label htmlFor="password">Password:</label>
        <input
          type="text"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          readOnly={!passwordEditMode}
        />
        {!passwordEditMode ? (
          <button onClick={handleEditPassword}>Edit</button>
        ) : (
          <div>
            <button onClick={handleSavePassword}>Save</button>
            <button onClick={handleCancelPassword}>Cancel</button>
          </div>
        )}</center>
      </div>
      <div>
        <center><label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          readOnly={!nameEditMode}
        />
        {!nameEditMode ? (
          <button onClick={handleEditName}>Edit</button>
        ) : (
          <div>
            <button onClick={handleSaveName}>Save</button>
            <button onClick={handleCancelName}>Cancel</button>
          </div>
        )}</center>
      </div>
      
    </div>
  );
}

export default Profile;
