import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeacherQuickNote } from './TeacherQuickNote';

// Mock the apiClient post. Intentionally hoisted so the component picks up the spy.
const postMock = vi.fn();
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));
// Silence sonner toasts in tests.
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  postMock.mockReset();
});

const openForm = async () => {
  await userEvent.click(screen.getByRole('button', { name: /publish a note/i }));
};
const titleInput = () => screen.getByPlaceholderText(/factorisation/i) as HTMLInputElement;
const bodyInput = () => screen.getByPlaceholderText(/type the note/i) as HTMLTextAreaElement;

describe('TeacherQuickNote', () => {
  it('starts as a compact button, opens the form on click', async () => {
    render(<TeacherQuickNote />);
    expect(screen.getByRole('button', { name: /publish a note/i })).toBeInTheDocument();
    await openForm();
    expect(titleInput()).toBeInTheDocument();
    expect(bodyInput()).toBeInTheDocument();
  });

  it('posts a note with the correct shape on publish', async () => {
    postMock.mockResolvedValue({ data: { id: 'new-uuid-123' }, error: null });
    const onPublished = vi.fn();
    render(<TeacherQuickNote onPublished={onPublished} />);

    await openForm();
    await userEvent.type(titleInput(), 'Hello test');
    await userEvent.type(bodyInput(), 'Body content');
    await userEvent.click(screen.getByRole('button', { name: /^publish$/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(1);
    });
    const [url, payload] = postMock.mock.calls[0];
    expect(url).toBe('/content/items/');
    expect(payload).toMatchObject({
      title: 'Hello test',
      description: 'Body content',
      content_type: 'notes',
      owner_type: 'teacher',
      visibility_scope: 'global',
      publication_status: 'published',
    });
    expect(onPublished).toHaveBeenCalledWith('new-uuid-123');
  });

  it('does not POST when title is missing', async () => {
    render(<TeacherQuickNote />);
    await openForm();
    await userEvent.type(bodyInput(), 'Body only');
    await userEvent.click(screen.getByRole('button', { name: /^publish$/i }));
    expect(postMock).not.toHaveBeenCalled();
  });
});
