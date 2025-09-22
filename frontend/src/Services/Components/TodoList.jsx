import React, { useState, useMemo } from 'react';
import TodoItem from './TodoItems';
import './TodoList.css';

function TodoList({ todos, updateTodo, deleteTodo }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = todos.length;
    // Accept both uppercase and capitalized status for compatibility
    const completed = todos.filter(todo => (todo.status === 'Completed' || todo.status === 'COMPLETED')).length;
    const inProgress = todos.filter(todo => (todo.status === 'In Progress' || todo.status === 'IN_PROGRESS')).length;
    const pending = todos.filter(todo => (todo.status === 'Pending' || todo.status === 'PENDING')).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, progress };
  }, [todos]);

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos;
    // Apply filter
    switch (filter) {
      case 'completed':
        filtered = todos.filter(todo => todo.status === 'Completed' || todo.status === 'COMPLETED');
        break;
      case 'pending':
        filtered = todos.filter(todo => todo.status === 'Pending' || todo.status === 'PENDING');
        break;
      case 'inprogress':
        filtered = todos.filter(todo => todo.status === 'In Progress' || todo.status === 'IN_PROGRESS');
        break;
      case 'high':
        filtered = todos.filter(todo => todo.priority === 'High' || todo.priority === 'HIGH');
        break;
      case 'medium':
        filtered = todos.filter(todo => todo.priority === 'Medium' || todo.priority === 'MEDIUM');
        break;
      case 'low':
        filtered = todos.filter(todo => todo.priority === 'Low' || todo.priority === 'LOW');
        break;
      default:
        filtered = todos;
    }
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });
    return sorted;
  }, [todos, filter, sortBy]);

  if (todos.length === 0) {
    return (
      <div className="todo-list-container">
        <div className="empty-state">
          <div className="empty-illustration">
            📝
          </div>
          <h3 className="empty-title">No todos yet!</h3>
          <p className="empty-message">
            Start organizing your life by adding your first todo above.
            Set priorities, deadlines, and watch your productivity soar! ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      {/* Statistics Section */}
      <div className="todo-list-stats">
        <div className="stat-card total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card inprogress">
          <span className="stat-number">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-label">
          <span>Overall Progress</span>
          <span>{stats.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: stats.progress > 0 ? `${stats.progress}%` : 0,
              minWidth: stats.progress > 0 ? '2px' : 0,
              height: '100%'
            }}
          ></div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="list-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'inprogress' ? 'active' : ''}`}
            onClick={() => setFilter('inprogress')}
          >
            In Progress
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High Priority
          </button>
        </div>

        <div className="sort-dropdown">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Todos Grid */}
      <div className="todos-grid">
        {filteredAndSortedTodos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            updateTodo={updateTodo}
            deleteTodo={deleteTodo}
            animationDelay={index * 0.1}
          />
        ))}
      </div>

      {filteredAndSortedTodos.length === 0 && filter !== 'all' && (
        <div className="empty-state">
          <div className="empty-illustration">
            🔍
          </div>
          <h3 className="empty-title">No todos match your filter</h3>
          <p className="empty-message">
            Try adjusting your filter or create a new todo that matches your criteria.
          </p>
        </div>
      )}
    </div>
  );
}

export default TodoList;