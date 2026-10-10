// TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { TaskItem } from './types';

interface TaskFormProps {
  onSave: (task: {
    title: string;
    description: string;
    completed: boolean
  }) => void;
  editingTask: TaskItem | null;
  onCancel: () => void;
}

export default function TaskForm({ onSave, editingTask, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setIsCompleted] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setIsCompleted(editingTask.completed);
    } else {
      setTitle('');
      setDescription('');
      setIsCompleted(false);
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({ title, description, completed });
    setTitle('');
    setDescription('');
    setIsCompleted(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', padding: '15px', background: '#f2f2F2', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0' }}>{editingTask ? '✏️ Update an existing to-do item' : '➕  Create an new to-do item'}</h3>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          fontWeight: '500'
        }}>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          required
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '50px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          id="completed"
          type="checkbox"
          checked={completed}
          onChange={(e) => setIsCompleted(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
        <label htmlFor="completed" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
          Completed
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ padding: '6px 12px', cursor: 'pointer' }}>
          {editingTask ? 'Apply Changes' : 'Save Item'}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancel} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}