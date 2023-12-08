import { useState, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Home.css'


function Home() {
    const [count, setCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState('');

    const history = useNavigate();

    const handleSignOut = () => {
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setIsAuthenticated(false);
        history('/signin');
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
            getUserLoggedIn();
        }
    });


    return (
        <div className='HomePage'>
            <header>
                <h2> Incident Management </h2>
            </header>
            <nav>
               <a href='/'><img className="logo" src="/Logo/1.png" /></a> 
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
            <main>
                <p><span className="Incident"> Incident Management </span>
                    Incident management for buildings refers to the systematic process and protocols in place to address and respond to various incidents or emergencies that may occur within a building or a built environment. These incidents can range from natural disasters like earthquakes, fires, floods, or severe weather events to human-made emergencies such as power outages, gas leaks, security breaches, or medical emergencies.

                    The primary objectives of incident management for buildings include:

                    Safety and Security: Ensuring the safety and security of occupants within the building during emergencies.

                    Minimizing Damage: Taking measures to minimize property damage and protect critical infrastructure.

                    Effective Response: Implementing structured plans and procedures to respond promptly and efficiently to incidents.

                    Continuity of Operations: Ensuring that essential services or operations continue or are quickly restored following an incident.
                </p>
            </main>
            <footer>
                Copyright &copy; 2023
                <a href="mailto:rcaraba@centennialcollege.ca">kjoghtap@centennialcollege.ca</a>
            </footer>
        </div>
    )
}

export default Home
