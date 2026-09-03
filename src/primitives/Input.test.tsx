import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('sets aria-invalid when error is true', () => {
    render(<Input aria-label="Prompt" error />);
    expect(screen.getByRole('textbox', { name: 'Prompt' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid by default', () => {
    render(<Input aria-label="Prompt" />);
    expect(screen.getByRole('textbox', { name: 'Prompt' })).not.toHaveAttribute('aria-invalid');
  });
});
