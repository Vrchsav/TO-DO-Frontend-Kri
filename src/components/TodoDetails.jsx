import React, { useState } from 'react';
import { todoService } from '../services/api';

const TodoDetails = ({ todo, onClose, onUpdate }) => {
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTodo, setEditedTodo] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    tags: todo.tags || [],
    mentions: todo.mentions?.map(m => m.username) || []
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setLoading(true);
    try {
      const response = await todoService.addNote(todo._id, noteContent);
      onUpdate(response.data);
      setNoteContent('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      tags: todo.tags || [],
      mentions: todo.mentions?.map(m => m.username) || []
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await todoService.updateTodo(todo._id, editedTodo);
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTodo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editedTodo.tags.includes(tagInput.trim())) {
        setEditedTodo(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setEditedTodo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <input
            type="text"
            name="title"
            value={editedTodo.title}
            onChange={handleInputChange}
            className="text-2xl font-bold text-gray-900 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-900">{todo.title}</h2>
        )}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-green-600 hover:text-green-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          {isEditing ? (
            <textarea
              name="description"
              value={editedTodo.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          ) : (
            <p className="mt-1 text-gray-900">{todo.description}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Priority</h3>
          {isEditing ? (
            <select
              name="priority"
              value={editedTodo.priority}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
              {todo.priority}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Tags</h3>
          {isEditing ? (
            <div className="mt-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {editedTodo.tags.map(tag => (
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap gap-2">
              {todo.tags?.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {todo.mentions && todo.mentions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Mentions</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {todo.mentions.map(mention => (
                <span
                  key={mention._id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800"
                >
                  @{mention.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
          <div className="mt-2 space-y-4">
            {todo.notes && todo.notes.map(note => (
              <div key={note._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <p className="text-gray-900">{note.content}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Added by {note.createdBy.name}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="mt-4">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !noteContent.trim()}
              className="mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TodoDetails; 