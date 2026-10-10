import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';
import { TaskItem } from './types';

const getTitleInput = () =>
  within(screen.getByText('Title:').parentElement as HTMLElement).getByRole(
    'textbox'
  ) as HTMLInputElement;

const getDescriptionInput = () =>
  within(screen.getByText('Description:').parentElement as HTMLElement).getByRole(
    'textbox'
  ) as HTMLTextAreaElement;

const getCompletedCheckbox = () =>
  screen.getByRole('checkbox', { name: 'Completed' }) as HTMLInputElement;

const makeTask = (overrides: Partial<TaskItem> = {}): TaskItem => ({
  id: 'task-1',
  title: 'Existing title',
  description: 'Existing description',
  completed: false,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  ...overrides,
});

function setup(props: Partial<React.ComponentProps<typeof TaskForm>> = {}) {
  const onSave = jest.fn();
  const onCancel = jest.fn();
  const utils = render(
    <TaskForm onSave={onSave} onCancel={onCancel} editingTask={null} {...props} />
  );
  return { onSave, onCancel, ...utils };
}

describe('TaskForm', () => {
  describe('create mode (editingTask = null)', () => {
    it('does not render a Cancel button', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('marks the title field as required', () => {
      setup();
      expect(getTitleInput()).toBeRequired();
    });

    it('calls onSave with title, description and completed on submit', async () => {
      const user = userEvent.setup();
      const { onSave } = setup();

      await user.type(getTitleInput(), 'Buy milk');
      await user.type(getDescriptionInput(), '2 liters, semi-skimmed');
      await user.click(screen.getByRole('button', { name: 'Save Item' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        title: 'Buy milk',
        description: '2 liters, semi-skimmed',
        completed: false,
      });
    });

    it('passes completed = true when the checkbox is ticked', async () => {
      const user = userEvent.setup();
      const { onSave } = setup();

      await user.type(getTitleInput(), 'Already done');
      await user.click(getCompletedCheckbox());
      expect(getCompletedCheckbox()).toBeChecked();
      await user.click(screen.getByRole('button', { name: 'Save Item' }));

      expect(onSave).toHaveBeenCalledWith({
        title: 'Already done',
        description: '',
        completed: true,
      });
    });

    it('allows an empty description', async () => {
      const user = userEvent.setup();
      const { onSave } = setup();

      await user.type(getTitleInput(), 'No description');
      await user.click(screen.getByRole('button', { name: 'Save Item' }));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'No description', description: '' })
      );
    });

    it('resets all fields after a successful submit', async () => {
      const user = userEvent.setup();
      setup();

      await user.type(getTitleInput(), 'Temp');
      await user.type(getDescriptionInput(), 'Temp description');
      await user.click(getCompletedCheckbox());
      await user.click(screen.getByRole('button', { name: 'Save Item' }));

      expect(getTitleInput()).toHaveValue('');
      expect(getDescriptionInput()).toHaveValue('');
      expect(getCompletedCheckbox()).not.toBeChecked();
    });

    it('does not call onSave when the title is empty', async () => {
      const user = userEvent.setup();
      const { onSave } = setup();

      await user.click(screen.getByRole('button', { name: 'Save Item' }));

      expect(onSave).not.toHaveBeenCalled();
    });

    it('does not call onSave when the title is only whitespace', async () => {
      const user = userEvent.setup();
      const { onSave } = setup();

      await user.type(getTitleInput(), '    ');
      await user.type(getDescriptionInput(), 'Has a description but no title');
      await user.click(screen.getByRole('button', { name: 'Save Item' }));

      expect(onSave).not.toHaveBeenCalled();
      // Nothing should have been wiped either
      expect(getDescriptionInput()).toHaveValue('Has a description but no title');
    });

    it('can be submitted with the Enter key from the title field', async () => {
      const user = userEvent.setup();
      const { onSave } = setup();

      await user.type(getTitleInput(), 'Submit with enter{Enter}');

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Submit with enter' })
      );
    });
  });

  describe('edit mode (editingTask provided)', () => {
    it('pre-fills the form with the task values', () => {
      setup({
        editingTask: makeTask({
          title: 'Write report',
          description: 'Quarterly numbers',
          completed: true,
        }),
      });

      expect(getTitleInput()).toHaveValue('Write report');
      expect(getDescriptionInput()).toHaveValue('Quarterly numbers');
      expect(getCompletedCheckbox()).toBeChecked();
    });

    it('shows the update heading and the Apply Changes button', () => {
      setup({ editingTask: makeTask() });

      expect(
        screen.getByRole('heading', { name: /update an existing to-do item/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apply Changes' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Save Item' })).not.toBeInTheDocument();
    });

    it('shows a Cancel button that calls onCancel', async () => {
      const user = userEvent.setup();
      const { onCancel, onSave } = setup({ editingTask: makeTask() });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with the edited values', async () => {
      const user = userEvent.setup();
      const { onSave } = setup({
        editingTask: makeTask({ title: 'Old title', description: 'Old desc' }),
      });

      await user.clear(getTitleInput());
      await user.type(getTitleInput(), 'New title');
      await user.clear(getDescriptionInput());
      await user.type(getDescriptionInput(), 'New desc');
      await user.click(getCompletedCheckbox());
      await user.click(screen.getByRole('button', { name: 'Apply Changes' }));

      expect(onSave).toHaveBeenCalledWith({
        title: 'New title',
        description: 'New desc',
        completed: true,
      });
    });

    it('does not call onSave if the title is cleared', async () => {
      const user = userEvent.setup();
      const { onSave } = setup({ editingTask: makeTask() });

      await user.clear(getTitleInput());
      await user.click(screen.getByRole('button', { name: 'Apply Changes' }));

      expect(onSave).not.toHaveBeenCalled();
    });

    it('updates the fields when a different task is passed in', () => {
      const { rerender, onSave, onCancel } = setup({
        editingTask: makeTask({ id: 'a', title: 'Task A', description: 'Desc A' }),
      });
      expect(getTitleInput()).toHaveValue('Task A');

      rerender(
        <TaskForm
          onSave={onSave}
          onCancel={onCancel}
          editingTask={makeTask({
            id: 'b',
            title: 'Task B',
            description: 'Desc B',
            completed: true,
          })}
        />
      );

      expect(getTitleInput()).toHaveValue('Task B');
      expect(getDescriptionInput()).toHaveValue('Desc B');
      expect(getCompletedCheckbox()).toBeChecked();
    });
  });
});
