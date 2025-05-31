import React, { useState, useEffect } from 'react';
import { todoService } from '../services/api';

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
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white text-xl">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Todo List</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <input
              type="text"
              name="title"
              value={newTodo.title}
              onChange={handleInputChange}
              placeholder="Todo title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-navy"
            />
            <textarea
              name="description"
              value={newTodo.description}
              onChange={handleInputChange}
              placeholder="Todo description"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-navy"
            />
            <select
              name="priority"
              value={newTodo.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-navy"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button 
              type="submit"
              className="w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-navy-dark transition-colors duration-200"
            >
              Add Todo
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {todos.length === 0 ? (
            <p className="text-white text-center text-lg">No todos yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <div 
                key={todo._id} 
                className={`bg-white rounded-lg shadow-lg p-6 ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </h3>
                    <p className={`mt-2 ${
                      todo.completed ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {todo.description}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      todo.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : todo.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleComplete(todo._id, todo.completed)}
                      className={`px-4 py-2 rounded-md ${
                        todo.completed
                          ? 'bg-gray-500 text-white hover:bg-gray-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      } transition-colors duration-200`}
                    >
                      {todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button 
                      onClick={() => handleDelete(todo._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList; 