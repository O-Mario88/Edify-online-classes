import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeacherQuickAssignment } from './TeacherQuickAssignment';

const postMock = vi.fn();
vi.mock('../../lib/apiClient', () => ({
  apiClient: { post: (...args: unknown[]) => postMock(...args) },
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  postMock.mockReset();
});

const openForm = async () =>
  userEvent.click(screen.getByRole('button', { name: /publish an assignment/i }));
const titleInput = () => screen.getByPlaceholderText(/essay 1/i) as HTMLInputElement;
const instructionsInput = () => screen.getByPlaceholderText(/describe what the student/i) as HTMLTextAreaElement;

describe('TeacherQuickAssignment', () => {
  it('starts compact, opens the form on click', async () => {
    render(<TeacherQuickAssignment />);
    await openForm();
    expect(titleInput()).toBeInTheDocument();
    expect(instructionsInput()).toBeInTheDocument();
  });

  it('posts the correct shape when both fields are filled', async () => {
    postMock.mockResolvedValue({ data: { id: 42 }, error: null });
    const onPublished = vi.fn();
    render(<TeacherQuickAssignment onPublished={onPublished} />);
    await openForm();
    await userEvent.type(titleInput(), 'Essay 1');
    await userEvent.type(instructionsInput(), 'Write about factorisation.');
    await userEvent.click(screen.getByRole('button', { name: /^publish$/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(1);
    });
    const [url, payload] = postMock.mock.calls[0];
    expect(url).toBe('/assessments/assessment/');
    expect(payload).toMatchObject({
      title: 'Essay 1',
      instructions: 'Write about factorisation.',
      type: 'assignment',
      source: 'manual_school_test',
      is_published: true,
    });
    expect(payload.max_score).toBe(100);
    expect(onPublished).toHaveBeenCalledWith(42);
  });

  it('does not POST when title is missing', async () => {
    render(<TeacherQuickAssignment />);
    await openForm();
    await userEvent.type(instructionsInput(), 'Body only');
    await userEvent.click(screen.getByRole('button', { name: /^publish$/i }));
    expect(postMock).not.toHaveBeenCalled();
  });

  it('rejects a non-positive max_score', async () => {
    render(<TeacherQuickAssignment />);
    await openForm();
    await userEvent.type(titleInput(), 'Bad score assignment');
    await userEvent.type(instructionsInput(), 'Prompt');
    const scoreInput = screen.getByDisplayValue('100') as HTMLInputElement;
    await userEvent.clear(scoreInput);
    await userEvent.type(scoreInput, '0');
    await userEvent.click(screen.getByRole('button', { name: /^publish$/i }));
    expect(postMock).not.toHaveBeenCalled();
  });
});
