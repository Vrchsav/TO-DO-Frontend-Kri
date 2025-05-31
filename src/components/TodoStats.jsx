import React from 'react';

const TodoStats = ({ stats }) => {
  const statItems = [
    {
      name: 'Total Todos',
      value: stats.totalTodos,
      color: 'bg-blue-500'
    },
    {
      name: 'Completed',
      value: stats.completedTodos,
      color: 'bg-green-500'
    },
    {
      name: 'Pending',
      value: stats.pendingTodos,
      color: 'bg-yellow-500'
    },
    {
      name: 'High Priority',
      value: stats.highPriority,
      color: 'bg-red-500'
    },
    {
      name: 'Medium Priority',
      value: stats.mediumPriority,
      color: 'bg-yellow-500'
    },
    {
      name: 'Low Priority',
      value: stats.lowPriority,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Todo Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item) => (
          <div
            key={item.name}
            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{item.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
              <span className="text-white text-lg font-medium">
                {item.name === 'Completion Rate' ? `${stats.completionRate}%` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoStats; 