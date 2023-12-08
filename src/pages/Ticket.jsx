import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { jwtDecode } from "jwt-decode";
import './Ticket.css';

function Ticket() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [urgency, setUrgency] = useState('');

  const [editTicketId, setEditTicketId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrgency, setEditUrgency] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState('');

  const history = useNavigate();
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
    const checkAuthAndFetchTickets = async () => {
      try {
        const token = getCookie('access_token');
  
        if (token) {
          setIsAuthenticated(true);
  
          const decodedToken = jwtDecode(token);
          console.log('Decoded token:', decodedToken);
          getUserLoggedIn();
  
          if (decodedToken) {
            const userId = decodedToken._id;
  
            const response = await fetch('http://localhost:3000/api/tickets', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
  
            if (response.ok) {
              const data = await response.json();
              console.log('Fetched tickets data:', data);

              data.result.forEach((ticket) => {
                if (ticket.photo) {
                  console.log('Ticket photo:', ticket.photo);
                }
              });
  
              const isAdmin = decodedToken.role === 'Admin';
  
              if (isAdmin) {
                setTickets(data.result);
              } else {
                const userTickets = data.result.filter(ticket => ticket.postedBy === userId);
                setTickets(userTickets);
              }
            } else {
              console.error('Failed to fetch tickets:', response.statusText);
            }
          } else {
            console.error('Failed to decode token');
          }
        } else {
          setIsAuthenticated(false);
          history('/signin');
        }
      } catch (error) {
        console.error('Error during authentication and ticket fetch:', error.message);
      }
    };
  
    checkAuthAndFetchTickets();
  }, [history]);

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
  
    if (name === 'title') {
      setTitle(value);
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'photo') {
      const file = files[0];
      const base64 = await convertToBase64(file);
      console.log('Base64:', base64);
      setPhoto(base64);
    } else if (name === 'urgency') {
      setUrgency(value);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = getCookie('access_token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken._id;
      const userName = decodedToken.name;
  
      const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          photo, // If photo is a base64 string, you can include it directly
          urgency,
          postedByName: userName,
          postedBy: userId,
        }),
      });
  
      if (response.ok) {
        const newTicket = await response.json();
        console.log('New Ticket:', newTicket);
  
        setTitle('');
        setDescription('');
        setPhoto(null);
        setUrgency('');
        // Refresh the page
        window.location.reload();
      } else {
        console.error('Failed to create ticket:', response.statusText);
      }
    } catch (error) {
      console.error('Error during ticket submission:', error.message);
    }
  };
  
  
  
  const handleSignOut = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
    history('/signin');
  };

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  const removeTicket = async (id) => {
    try {
      const token = getCookie('access_token');
      const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Deleted ticket:', data);
        window.location.reload();
      } else {
        console.error('Failed to delete ticket:', response.statusText);
      }
    } catch (error) {
      console.error('Error during ticket deletion:', error.message);
    }
  };

  const handleEditClick = (ticketId) => {
    setEditTicketId(ticketId);
  };

  const handleCancelEdit = () => {
    setEditTicketId(null);
  };

  const urgencyOptions = ['Low', 'Medium', 'High'];

  const handleSaveEdit = async (editedTicket) => {
  try {
    const token = getCookie('access_token');
    
    if (!urgencyOptions.includes(editedTicket.urgency)) {
      console.error('Invalid urgency value:', editedTicket.urgency);
      return;
    }

    if (!editedTicket.description || !editedTicket.title) {
      console.error('Description and title are required.');
      return;
    }

    const response = await fetch(`http://localhost:3000/api/tickets/${editedTicket._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editedTicket.title,
        description: editedTicket.description,
        urgency: editedTicket.urgency,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Updated ticket:', data);
      setEditTicketId(null);
      window.location.reload();
    } else {
      console.error('Failed to update ticket:', response.statusText);
    }
  } catch (error) {
    console.error('Error during ticket update:', error.message);
  }
};

function convertToBase64(file){
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result)
    };
    fileReader.onerror = (error) => {
      reject(error)
    }
  })
}
  
  return (
    <div className='TicketPage'>
      <header>
        <h2>Incident Management</h2>
      </header>
      <nav>
        <a href='/'>
          <img className="logo" src="/Logo/1.png" alt="Logo" />
        </a>
        <p className="welcome">Welcome {userLoggedIn}!</p>
        <ul>
          <li> <a href="/">Home Page </a></li>
          <li style={{display: isAuthenticated ? "block" : "none"}}> <a href="/profile">Profile</a> </li>
          <li  style={{display: isAuthenticated ? "block" : "none"}}> <a href="/ticket">Ticket Management</a></li>
          <li style={{display: isAuthenticated ? "none" : "block"}}> <a href="/signin">Sign in</a></li>
            {isAuthenticated && (
              <button onClick={handleSignOut} className="sign-out-button">
                Sign Out
              </button>)}
        </ul>
      </nav>
      <main>
        <p><span className="Ticket">Ticket Management</span></p>
        <table className="custom-table">
          <thead>
            <tr>
              <th></th>
              <th>Number</th>
              <th>Title</th>
              <th>Description</th>
              <th>Date created</th>
              <th>Photo</th>
              <th>Posted By</th>
              <th>Status</th>
              <th>Urgency</th>
            </tr>
          </thead>
          <tbody>
      {tickets.map((ticket, index) => (
        <tr key={index}>
          <td>
            <div className="rowData">
              <button onClick={() => removeTicket(ticket._id)}>Remove</button>
              <button onClick={() => handleEditClick(ticket._id)}>Modify</button>
            </div>
          </td>
          <td>{ticket._id}</td>
          <td>{editTicketId === ticket._id ? <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> : ticket.title}</td>
          <td>{editTicketId === ticket._id ? <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /> : ticket.description}</td>
          <td>{formatDateTime(ticket.created)}</td>
          <td>
           {ticket.photo ? (<img className="ticket-image" src={ticket.photo} alt="Ticket" /> ) : ( <p>No photo available</p>)}
          </td>
          <td>{ticket.postedByName}</td>
          <td>{ticket.status}</td>
          <td>
            {editTicketId === ticket._id ? (
              <select value={editUrgency} onChange={(e) => setEditUrgency(e.target.value)}>
                {urgencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              ticket.urgency
            )}
          </td>
          {editTicketId === ticket._id && (
            <td>
              <button onClick={() => handleSaveEdit({ ...ticket, title: editTitle, description: editDescription, urgency: editUrgency })}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </td>
          )}
        </tr>
      ))}
    </tbody>
        </table>

        <p><span className="Ticket">Create New Ticket</span></p>

        <form onSubmit={handleSubmit} className="form-container" encType="multipart/form-data">
        <label className="form-label">
          Title:
          <input type="text" name="title" value={title} onChange={handleInputChange} className="form-input" />
        </label>
        <label className="form-label">
          Description:
          <input type="text" name="description" value={description} onChange={handleInputChange} className="form-input" />
        </label>
        Photo:
        <input
          type="file"
          name="photo"
          onChange={handleInputChange}
          className="form-input"
        />
        <label className="form-label">
          Urgency:
          <div className="urgency-radio">
              <label>
                <input
                  type="radio"
                  name="urgency"
                  value="Low"
                  checked={urgency === 'Low'}
                  onChange={handleInputChange}
                />
                Low
              </label>
              <label>
                <input
                  type="radio"
                  name="urgency"
                  value="Medium"
                  checked={urgency === 'Medium'}
                  onChange={handleInputChange}
                />
                Medium
              </label>
              <label>
                <input
                  type="radio"
                  name="urgency"
                  value="High"
                  checked={urgency === 'High'}
                  onChange={handleInputChange}
                />
                High
              </label>
            </div>
          </label>
          <button type="submit" className="form-button">Submit</button>
        </form>
      </main>
      <footer>
        Copyright &copy; 2023
        <a href="mailto:rcaraba@centennialcollege.ca">kjoghtap@centennialcollege.ca</a>
      </footer>
    </div>
  );
}

export default Ticket;
