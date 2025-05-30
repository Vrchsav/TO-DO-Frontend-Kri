import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { todoService } from '../services/api';
import '../styles/TodoList.css';

const TodoList = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos...');
      const response = await todoService.getAllTodos();
      console.log('Todos response:', response);
      setTodos(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to fetch todos');
      setTodos([]);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      console.log('Adding todo:', { title: newTodo });
      const response = await todoService.createTodo({ title: newTodo });
      console.log('Add todo response:', response);
      if (response.data && typeof response.data === 'object') {
        setTodos(prevTodos => [...prevTodos, response.data]);
        setNewTodo('');
        toast.success('Todo added successfully!');
      }
    } catch (error) {
      console.error('Error adding todo:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to add todo');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      console.log('Toggling todo:', { id, completed: !completed });
      const response = await todoService.updateTodo(id, { completed: !completed });
      console.log('Toggle response:', response);
      if (response.data && typeof response.data === 'object') {
        setTodos(prevTodos => 
          prevTodos.map(todo => todo._id === id ? response.data : todo)
        );
        toast.success('Todo updated successfully!');
      }
    } catch (error) {
      console.error('Error updating todo:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      console.log('Deleting todo:', id);
      await todoService.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo._id !== id));
      toast.success('Todo deleted successfully!');
    } catch (error) {
      console.error('Error deleting todo:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to delete todo');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>My Todo List</h1>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button type="submit" className="add-button">
          <FaPlus /> Add
        </button>
      </form>

      <div className="todo-list">
        {Array.isArray(todos) && todos.length > 0 ? (
          todos.map((todo) => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo._id, todo.completed)}
                className="todo-checkbox"
              />
              <span className="todo-title">{todo.title}</span>
              <button
                onClick={() => handleDeleteTodo(todo._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="no-todos">No todos yet. Add one above!</p>
        )}
      </div>
    </div>
  );
};

export default TodoList; 