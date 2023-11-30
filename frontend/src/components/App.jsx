import { useNavigate, Outlet } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import '../styles/App.css';

function App() {
  const [error, setError] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (shouldUpdate) {
      setShouldUpdate(false);
    } else {
      fetch("http://localhost:3000/api", {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.isAuthenticated) {
            navigate('/login');
          } else {
            setServerResponse({ user: res.user, friends: res.friends });
          }
        })
        .catch((err) => setError(err));
    }
  }, [shouldUpdate]);

  const logoutHandler = () => {
    fetch("http://localhost:3000/api/logout", {
      credentials: 'include',
    })
      .then(() => navigate('/login'))
      .catch((err) => setError(err));
  }

  if (error) return (
    <div className='mainContent'>
      <h2>A network error was encountered</h2>
    </div>
  );

  return (
    <>
      <header>
        <h1>Messaging App</h1>
        {serverResponse ? (
          <button className='logoutBtn' onClick={logoutHandler}>Log Out</button>
        ) : ""}
      </header>
      {serverResponse && (
        <div className='mainContent'>
          <Outlet context={{
            serverResponse: serverResponse,
            setNewServerResponse: () => setShouldUpdate(true),
          }} />
        </div>
      )}
    </>
  );
}

export default App
