import React, { useState, useEffect } from 'react';
import { todoService, userService } from '../services/api';

const TodoForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    mentions: []
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userService.getUsers();
        const currentUser = userService.getCurrentUser();
        console.log('All users:', usersResponse);
        console.log('Current user:', currentUser);
        setUsers(usersResponse || []);
        setCurrentUser(currentUser);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        tags: initialData.tags || [],
        mentions: initialData.mentions?.map(m => m.username) || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUserSelect = (e) => {
    const selectedUsername = e.target.value;
    if (selectedUsername && !formData.mentions.includes(selectedUsername)) {
      setFormData(prev => ({
        ...prev,
        mentions: [...prev.mentions, selectedUsername]
      }));
    }
    setSelectedUser('');
  };

  const removeMention = (mentionToRemove) => {
    setFormData(prev => ({
      ...prev,
      mentions: prev.mentions.filter(mention => mention !== mentionToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          tags: [],
          mentions: []
        });
      }
    } catch (error) {
      console.error('Error submitting todo:', error);
    }
    setLoading(false);
  };

  // Filter out current user from the dropdown options
  const filteredUsers = Array.isArray(users) ? users.filter(user => user._id !== currentUser?.id) : [];
  console.log('Filtered users for dropdown:', filteredUsers);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add tags (press Enter)"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mentions</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {formData.mentions.map(mention => (
            <span
              key={mention}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800"
            >
              @{mention}
              <button
                type="button"
                onClick={() => removeMention(mention)}
                className="ml-1 inline-flex items-center p-0.5 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <select
          value={selectedUser}
          onChange={handleUserSelect}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          disabled={loadingUsers}
        >
          <option value="">Select a user to mention</option>
          {filteredUsers.map(user => (
            <option key={user._id} value={user.username}>
              {user.name} (@{user.username})
            </option>
          ))}
        </select>
        {loadingUsers && (
          <p className="mt-1 text-sm text-gray-500">Loading users...</p>
        )}
        {!loadingUsers && filteredUsers.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">No other users available</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : initialData ? 'Update Todo' : 'Create Todo'}
      </button>
    </form>
  );
};

export default TodoForm; 