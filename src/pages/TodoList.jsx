import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { todoService } from '../services/api';
import { authService } from '../services/api';
import { userService } from '../services/api';
import TodoForm from '../components/TodoForm';
import TodoDetails from '../components/TodoDetails';
import TodoStats from '../components/TodoStats';

const TodoList = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    priority: '',
    tag: '',
    mention: '',
    completed: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showHistory, setShowHistory] = useState(false);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters
      };
      const response = await todoService.getTodos(params);
      setTodos(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError('Error fetching todos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await todoService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCompletedTodos = async () => {
    try {
      setHistoryLoading(true);
      const response = await todoService.getTodos({
        completed: 'true',
        page: 1,
        limit: 10,
        sortBy: 'completedAt',
        sortOrder: 'desc'
      });
      setCompletedTodos(response.data);
    } catch (error) {
      console.error('Error fetching completed todos:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [pagination.page, filters, sortBy, sortOrder]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showHistory) {
      fetchCompletedTodos();
    }
  }, [showHistory]);

  const handleCreateTodo = async (todoData) => {
    try {
      await todoService.createTodo(todoData);
      fetchTodos();
      fetchStats();
    } catch (error) {
      setError('Error creating todo');
      console.error('Error:', error);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const response = await todoService.updateTodo(id, todoData);
      fetchTodos();
      fetchStats();
      if (showHistory) {
        fetchCompletedTodos();
      }
      if (selectedTodo?._id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      setError('Error updating todo');
      console.error('Error:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      fetchTodos();
      fetchStats();
      if (selectedTodo?._id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      setError('Error deleting todo');
      console.error('Error:', error);
    }
  };

  const handleFilterChange = async (filterType, value) => {
    try {
      setFilterLoading(true);
      setError(null);
      
      // Update filters state
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));

      // Reset pagination when filters change
      setPagination(prev => ({
        ...prev,
        page: 1
      }));

      // Fetch todos with new filters
      const response = await todoService.getTodos({
        ...filters,
        [filterType]: value,
        page: 1,
        limit: pagination.limit
      });

      setTodos(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error applying filters');
      console.error('Filter error:', err);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const { value } = e.target;
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-navy">Todo List</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Create Todo
          </button>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                name="priority"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={filterLoading}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <input
                type="text"
                name="tag"
                value={filters.tag}
                onChange={(e) => handleFilterChange('tag', e.target.value)}
                placeholder="Filter by tag"
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={filterLoading}
              />

              <input
                type="text"
                value={filters.mention}
                onChange={(e) => handleFilterChange('mention', e.target.value)}
                placeholder="Filter by username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={filterLoading}
              />

              <select
                name="completed"
                value={filters.completed}
                onChange={(e) => handleFilterChange('completed', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={filterLoading}
              >
                <option value="">All Status</option>
                <option value="true">Completed</option>
                <option value="false">Pending</option>
              </select>

              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search todos..."
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={filterLoading}
              />

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={filterLoading}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="priority-asc">Priority (Low to High)</option>
              </select>
            </div>

            {filterLoading && (
              <div className="text-center py-2 text-gray-500">Applying filters...</div>
            )}

            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <div className="space-y-4">
                {todos.map(todo => (
                  <div
                    key={todo._id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedTodo(todo)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h3>
                        <p className={`mt-1 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todo.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTodo(todo._id, { ...todo, completed: !todo.completed });
                          }}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            todo.completed
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this todo?')) {
                              handleDeleteTodo(todo._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {todo.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {todo.mentions?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {todo.mentions.map(mention => (
                          <span
                            key={mention._id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                          >
                            @{mention.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {new Date(todo.createdAt).toLocaleString()}</span>
                      <span>{todo.notes?.length || 0} notes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          {stats && <TodoStats stats={stats} />}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-navy">History</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            {showHistory ? 'Hide History' : 'Show History'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform ${showHistory ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {showHistory && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {historyLoading ? (
              <div className="text-center py-4">Loading history...</div>
            ) : completedTodos.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No completed todos yet</div>
            ) : (
              <div className="space-y-4">
                {completedTodos.map(todo => (
                  <div
                    key={todo._id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium line-through text-gray-500">
                          {todo.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {todo.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {todo.tags?.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateTodo(todo._id, { ...todo, completed: false })}
                          className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          Mark Incomplete
                        </button>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Completed: {new Date(todo.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <TodoDetails
            todo={selectedTodo}
            onClose={() => setSelectedTodo(null)}
            onUpdate={handleUpdateTodo}
          />
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Todo</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <TodoForm 
              onSubmit={async (todoData) => {
                await handleCreateTodo(todoData);
                setShowCreateModal(false);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList; 