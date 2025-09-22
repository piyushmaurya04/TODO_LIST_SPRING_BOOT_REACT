import { useEffect, useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './Components/Login'
import Signup from './Components/Signup'
import todoService from './Services/TodoService'
import AddTodo from './Services/Components/AddTodo'
import TodoList from './Services/Components/TodoList'

// Main Todo Application Component
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const { logout, user } = useAuth();


  // Fetch todos whenever user changes (login/logout)
  useEffect(() => {
    if (user) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [user]);

  const fetchTodos = () => {
    todoService.getAllTodos().then(response => {
      setTodos(response.todos || []);
      console.log(response);
    }).catch(error => {
      console.error('Error fetching todos:', error);
    });
  }

  const addTodo = (title, description, date, priority, status, completed) => {
    // Accept status as already mapped to backend enum
    const newTodo = {
      title,
      description,
      date,
      priority,
      status: status || "PENDING",
      completed: false
    };
    todoService.createTodo(newTodo).then(response => {
      const todo = response.todo || response;
      setTodos([...todos, todo]);
    }).catch(error => {
      console.error('Error adding todo:', error);
    });
  }

  const updateTodo = (id, todo) => {
    todoService.updateTodo(id, todo).then(response => {
      fetchTodos();
    }).catch(error => {
      console.error('Error updating todo:', error);
    });
  }

  const deleteTodo = (id) => {
    todoService.deleteTodo(id).then(response => {
      fetchTodos();
    }).catch(error => {
      console.error('Error deleting todo:', error);
    });
  }

  const handleLogout = () => {
    logout();
  }

  return (
    <div className="app-container">
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="decorative-dots top-left"></div>
      <div className="decorative-dots bottom-right"></div>

      <div className="main-container">
        <div className="app-header">
          <div className="header-content">
            <div>
              <h1 className="app-title">✨ Todo Masterpiece</h1>
              <p className="app-subtitle">Welcome back, {user?.username || user?.firstName || 'User'}!</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="content-section">
          <div className="glass-container">
            <AddTodo addtodo={addTodo} />
          </div>
        </div>

        <div className="content-section">
          <TodoList todos={todos} updateTodo={updateTodo} deleteTodo={deleteTodo} />
        </div>
      </div>
    </div>
  )
}

// Main App Component with Authentication Logic
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return <TodoApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
