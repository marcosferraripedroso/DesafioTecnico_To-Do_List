
import React, { useState } from 'react';
import { TaskItem } from './types';
import TaskForm from './TaskForm';

export default function TaskManager() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);//Array of itns
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  
  const [searchTitle, setSearchTitle] = useState('');
  const [flagFilter, setFlagFilter] = useState<'all' | 'flagged' | 'unflagged'>('all');

  const handleSaveTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    if (editingTask) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingTask.id ? { ...task, ...taskData } : task
        )
      );
      setEditingTask(null);
    } else {
      const newTask: TaskItem = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed,
        createdAt: new Date(),
      };
      setTasks(prev => [...prev, newTask]);
    }
  };
 
  const handleRemoveTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (editingTask?.id === id) setEditingTask(null);
  };

 const handleToggleFlag = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTitle = task.title.toLowerCase().includes(searchTitle.toLowerCase());
    
    const matchesFlag = 
      flagFilter === 'all' ||
      (flagFilter === 'flagged' && task.completed) ||
      (flagFilter === 'unflagged' && !task.completed);

    return matchesTitle && matchesFlag;
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Take-Home Challenge: To-Do List Application</h2>
      
      <TaskForm 
        onSave={handleSaveTask} 
        editingTask={editingTask} 
        onCancel={() => setEditingTask(null)} 
      />

      <div style={{ background: '#edf2f7', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Display Filter Controls</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Text search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Search Title:</label>
            <input
              type="text"
              placeholder=" Search and filter to-do items by title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '4px' }}
            />
          </div>

          {/* Completed search */}
          <div style={{ width: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Completed mark:</label>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value as any)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', background: '#fff' }}
            >
              <option value="all">All Items</option>
              <option value="flagged">⭐ Completed</option>
              <option value="unflagged">Normal Only</option>
            </select>
          </div>

        </div>
      </div>

      {}
      <h3>Search Results ({filteredTasks.length})</h3>
      {filteredTasks.length === 0 ? (
        <p style={{ color: '#718096', fontStyle: 'italic' }}>No matching to-do item found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredTasks.map(task => (
            <li 
              key={task.id} 
              style={{ 
                border: '1px solid #e2e8f0', 
                padding: '15px', 
                marginBottom: '10px', 
                borderRadius: '6px',
                borderLeft: task.completed ? '5px solid #ecc94b' : '5px solid #cbd5e0',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>
                    {task.completed ? '⭐ ' : ''}{task.title}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: '#4a5568', fontSize: '14px' }}>{task.description}</p>
                  <small style={{ color: '#a0aec0' }}>Created: {task.createdAt.toLocaleTimeString()}</small>
                </div>
                
                <button 
                  onClick={() => handleToggleFlag(task.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                  title="Toggle Flag Priority"
                >
                  {task.completed ? '★' : '☆'}
                </button>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditingTask(task)} style={{ padding: '4px 10px' }}>Edit</button>
                <button onClick={() => handleRemoveTask(task.id)} style={{ padding: '4px 10px', color: '#e53e3e' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}