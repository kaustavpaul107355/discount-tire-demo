import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TireCare } from '@/app/components/TireCare';

// Mock fetch
global.fetch = vi.fn();

describe('TireCare Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component title and description', () => {
    render(<TireCare />);
    
    expect(screen.getByText('Tire Care and Safety')).toBeInTheDocument();
    expect(screen.getByText(/This guide provides an understanding/)).toBeInTheDocument();
  });

  it('renders the input field and send button', () => {
    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    expect(input).toBeInTheDocument();
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    expect(sendButton).toBeInTheDocument();
  });

  it('displays suggested questions initially', () => {
    render(<TireCare />);
    
    expect(screen.getByText('How often should I rotate my tires?')).toBeInTheDocument();
    expect(screen.getByText('What is the proper tire pressure?')).toBeInTheDocument();
    expect(screen.getByText('When should I replace my tires?')).toBeInTheDocument();
    expect(screen.getByText('How do I check tire tread depth?')).toBeInTheDocument();
  });

  it('displays empty state message when no messages', () => {
    render(<TireCare />);
    
    expect(screen.getByText('Ask me anything about tire care and safety')).toBeInTheDocument();
    expect(screen.getByText(/I can help with maintenance, safety tips/)).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<TireCare />);
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    fireEvent.change(input, { target: { value: 'How often to rotate?' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    expect(sendButton).not.toBeDisabled();
  });

  it('submits question and displays response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'You should rotate your tires every 5,000-7,500 miles.',
      }),
    });

    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    fireEvent.change(input, { target: { value: 'How often should I rotate?' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    fireEvent.click(sendButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('How often should I rotate?')).toBeInTheDocument();
    });

    // Should show response
    await waitFor(() => {
      expect(screen.getByText(/You should rotate your tires every/)).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response' }),
    });

    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test question' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    fireEvent.change(input, { target: { value: 'Test question' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Error message from TireCare component
      expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
    });
  });

  it('clicking suggested question fills input', () => {
    render(<TireCare />);
    
    const suggestedQuestion = screen.getByText('How often should I rotate my tires?');
    fireEvent.click(suggestedQuestion);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/) as HTMLInputElement;
    expect(input.value).toBe('How often should I rotate my tires?');
  });

  it('hides suggested questions after first message', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response' }),
    });

    render(<TireCare />);
    
    expect(screen.getByText('How often should I rotate my tires?')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    fireEvent.change(input, { target: { value: 'Test' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.queryByText('How often should I rotate my tires?')).not.toBeInTheDocument();
    });
  });

  it('makes correct API call', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response' }),
    });

    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    fireEvent.change(input, { target: { value: 'Test question' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/ });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/knowledge-assistant', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test question'),
      }));
    });
  });

  it('displays multiple messages in conversation', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'First response' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Second response' }),
      });

    render(<TireCare />);
    
    const input = screen.getByPlaceholderText(/Ask about tire care/);
    
    // Send first message
    fireEvent.change(input, { target: { value: 'First question' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));

    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();
    });

    // Send second message
    fireEvent.change(input, { target: { value: 'Second question' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));

    await waitFor(() => {
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });

    // Both messages should be visible
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('First response')).toBeInTheDocument();
  });
});
