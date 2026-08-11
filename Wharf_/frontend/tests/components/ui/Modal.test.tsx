import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../../../src/components/ui/Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    // We assume modal uses a portal or simple conditional rendering
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Content hidden
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Visible Title">
        Visible Content
      </Modal>
    );
    expect(screen.getByText('Visible Title')).toBeInTheDocument();
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );
    
    // Select The First Button In The Document, Which Will Be The Close Button In This Isolated Test
    const closeBtn = screen.getByRole('button');
    if(closeBtn){
        fireEvent.click(closeBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });
});

