import React, { useState, useEffect } from 'react';
import { todoService } from '../services/api';
import '../styles/TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoService.getTodos();
      setTodos(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTodo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await todoService.createTodo(newTodo);
      setTodos(prev => [...prev, response.data]);
      setNewTodo({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting todo');
      console.error('Error deleting todo:', err);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await todoService.updateTodo(id, { completed: !completed });
      setTodos(prev => prev.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating todo');
      console.error('Error updating todo:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading todos...</div>;
  }

  return (
    <div className="todo-container">
      <h1>Todo List</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          name="title"
          value={newTodo.title}
          onChange={handleInputChange}
          placeholder="Todo title"
          required
        />
        <textarea
          name="description"
          value={newTodo.description}
          onChange={handleInputChange}
          placeholder="Todo description"
        />
        <select
          name="priority"
          value={newTodo.priority}
          onChange={handleInputChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit">Add Todo</button>
      </form>

      <div className="todos-list">
        {todos.length === 0 ? (
          <p className="no-todos">No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <h3>{todo.title}</h3>
                <p>{todo.description}</p>
                <span className={`priority ${todo.priority}`}>{todo.priority}</span>
              </div>
              <div className="todo-actions">
                <button
                  onClick={() => handleToggleComplete(todo._id, todo.completed)}
                  className={todo.completed ? 'completed' : ''}
                >
                  {todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => handleDelete(todo._id)} className="delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList; 