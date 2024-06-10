import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
};

function App() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
      async function fetchData() {
        const response = await fetch('http://localhost:5221/api/User');
        const data = await response.json();
        setUsers(data);
      }
      fetchData();
    }, []);

    return (
      <div>
        <h1>User List</h1>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} {user.surname} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    );
  }

export default App;
