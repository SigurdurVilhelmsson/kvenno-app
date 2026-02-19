// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Modal, SaveDialog, ConfirmDialog } from '../components/Modal';
import { Toast } from '../components/Toast';

// Mock lucide-react icons to avoid SVG rendering issues in jsdom
vi.mock('lucide-react', () => ({
  Upload: (props: Record<string, unknown>) => <div data-testid="upload-icon" {...props} />,
  CheckCircle: (props: Record<string, unknown>) => <div data-testid="check-circle-icon" {...props} />,
  RotateCcw: (props: Record<string, unknown>) => <div data-testid="rotate-icon" {...props} />,
  XCircle: (props: Record<string, unknown>) => <div data-testid="x-circle-icon" {...props} />,
  AlertTriangle: (props: Record<string, unknown>) => <div data-testid="alert-icon" {...props} />,
  Info: (props: Record<string, unknown>) => <div data-testid="info-icon" {...props} />,
}));

// Mock file processing utils used by FileUpload
vi.mock('@/utils/fileProcessing', () => ({
  getFileTypeDescription: (file: File) => `${file.type || 'unknown'} file`,
}));

// ---------------------------------------------------------------------------
// Modal tests
// ---------------------------------------------------------------------------
describe('Modal component', () => {
  it('renders children when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Prufugluggi">
        <p>Efni glugga</p>
      </Modal>
    );

    expect(screen.getByText('Prufugluggi')).toBeDefined();
    expect(screen.getByText('Efni glugga')).toBeDefined();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Prufugluggi">
        <p>Efni glugga</p>
      </Modal>
    );

    expect(screen.queryByText('Prufugluggi')).toBeNull();
    expect(screen.queryByText('Efni glugga')).toBeNull();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Prufugluggi">
        <p>Efni glugga</p>
      </Modal>
    );

    // Click the backdrop (the outer div)
    const backdrop = screen.getByText('Efni glugga').closest('.fixed');
    expect(backdrop).toBeDefined();
    fireEvent.click(backdrop!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Prufugluggi">
        <p>Efni glugga</p>
      </Modal>
    );

    // Click inside the modal content area
    fireEvent.click(screen.getByText('Efni glugga'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders the title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Vista greiningu">
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByText('Vista greiningu')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// SaveDialog tests
// ---------------------------------------------------------------------------
describe('SaveDialog component', () => {
  it('renders when open with default name', () => {
    render(
      <SaveDialog
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        defaultName="Tilraun 1"
      />
    );

    expect(screen.getByText('Vista greiningu')).toBeDefined();
    const input = screen.getByPlaceholderText('Sláðu inn heiti...');
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe('Tilraun 1');
  });

  it('does not render when closed', () => {
    render(
      <SaveDialog
        isOpen={false}
        onClose={() => {}}
        onSave={() => {}}
        defaultName="Tilraun 1"
      />
    );

    expect(screen.queryByText('Vista greiningu')).toBeNull();
  });

  it('calls onSave with the entered name', () => {
    const onSave = vi.fn();
    render(
      <SaveDialog
        isOpen={true}
        onClose={() => {}}
        onSave={onSave}
        defaultName="Tilraun 1"
      />
    );

    const saveButton = screen.getByText('Vista');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith('Tilraun 1');
  });

  it('calls onClose when Haetta vid is clicked', () => {
    const onClose = vi.fn();
    render(
      <SaveDialog
        isOpen={true}
        onClose={onClose}
        onSave={() => {}}
        defaultName="Tilraun 1"
      />
    );

    fireEvent.click(screen.getByText('Hætta við'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables save button when name is empty', () => {
    render(
      <SaveDialog
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        defaultName=""
      />
    );

    const saveButton = screen.getByText('Vista') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ConfirmDialog tests
// ---------------------------------------------------------------------------
describe('ConfirmDialog component', () => {
  it('renders when open with title and message', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Eyða greiningu"
        message="Ertu viss um að þú viljir eyða þessari greiningu?"
        confirmText="Eyða"
      />
    );

    expect(screen.getByText('Eyða greiningu')).toBeDefined();
    expect(
      screen.getByText('Ertu viss um að þú viljir eyða þessari greiningu?')
    ).toBeDefined();
  });

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Eyða greiningu"
        message="Ertu viss?"
        confirmText="Eyða"
      />
    );

    expect(screen.queryByText('Eyða greiningu')).toBeNull();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Eyða greiningu"
        message="Ertu viss?"
        confirmText="Eyða"
      />
    );

    fireEvent.click(screen.getByText('Eyða'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Eyða"
        message="Ertu viss?"
        confirmText="Já"
      />
    );

    fireEvent.click(screen.getByText('Hætta við'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom cancel text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Staðfesta"
        message="Ertu viss?"
        confirmText="Já"
        cancelText="Nei"
      />
    );

    expect(screen.getByText('Nei')).toBeDefined();
    expect(screen.queryByText('Hætta við')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Toast tests
// ---------------------------------------------------------------------------
describe('Toast component', () => {
  it('displays success message', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Greining vistuð!',
          type: 'success',
        }}
      />
    );

    expect(screen.getByText('Greining vistuð!')).toBeDefined();
  });

  it('displays error message', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Villa kom upp',
          type: 'error',
        }}
      />
    );

    expect(screen.getByText('Villa kom upp')).toBeDefined();
  });

  it('displays warning message', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Athugið!',
          type: 'warning',
        }}
      />
    );

    expect(screen.getByText('Athugið!')).toBeDefined();
  });

  it('displays info message', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Upplýsingar',
          type: 'info',
        }}
      />
    );

    expect(screen.getByText('Upplýsingar')).toBeDefined();
  });

  it('does not render when show is false', () => {
    render(
      <Toast
        toast={{
          show: false,
          message: 'Hidden toast',
          type: 'success',
        }}
      />
    );

    expect(screen.queryByText('Hidden toast')).toBeNull();
  });

  it('renders the appropriate icon for success type', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Success',
          type: 'success',
        }}
      />
    );

    expect(screen.getByTestId('check-circle-icon')).toBeDefined();
  });

  it('renders the appropriate icon for error type', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Error',
          type: 'error',
        }}
      />
    );

    expect(screen.getByTestId('x-circle-icon')).toBeDefined();
  });

  it('renders the appropriate icon for warning type', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Warning',
          type: 'warning',
        }}
      />
    );

    expect(screen.getByTestId('alert-icon')).toBeDefined();
  });

  it('renders the appropriate icon for info type', () => {
    render(
      <Toast
        toast={{
          show: true,
          message: 'Info',
          type: 'info',
        }}
      />
    );

    expect(screen.getByTestId('info-icon')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// FileUpload tests
// ---------------------------------------------------------------------------
describe('FileUpload component', () => {
  // Dynamically import FileUpload so the mocks above are applied first
  async function getFileUpload() {
    const mod = await import('../components/FileUpload');
    return mod.FileUpload;
  }

  it('renders upload area with title for teacher mode', async () => {
    const FileUpload = await getFileUpload();
    render(
      <FileUpload
        files={[]}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('Hladdu upp skýrslum')).toBeDefined();
  });

  it('renders upload area with title for student mode', async () => {
    const FileUpload = await getFileUpload();
    render(
      <FileUpload
        files={[]}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="student"
      />
    );

    expect(screen.getByText('Veldu skrá')).toBeDefined();
  });

  it('renders file type description', async () => {
    const FileUpload = await getFileUpload();
    render(
      <FileUpload
        files={[]}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(
      screen.getByText('Word skjöl (.docx), PDF skrár (.pdf) eða myndir - margar í einu')
    ).toBeDefined();
  });

  it('renders button to select files', async () => {
    const FileUpload = await getFileUpload();
    render(
      <FileUpload
        files={[]}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('Velja skrár')).toBeDefined();
  });

  it('shows selected files count when files are provided', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      new File(['content'], 'test2.pdf', { type: 'application/pdf' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('2 skrár valinar')).toBeDefined();
  });

  it('shows singular file count for 1 file', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('1 skrá valin')).toBeDefined();
  });

  it('renders process button when files are selected', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('Greina skýrslur')).toBeDefined();
  });

  it('renders student-mode process button text', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="student"
      />
    );

    expect(screen.getByText('Fá endurgjöf á drögin')).toBeDefined();
  });

  it('shows processing status when processing', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={true}
        processingStatus={{ current: 1, total: 3, currentFile: 'test.docx' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('Vinn úr skýrslum... (1/3)')).toBeDefined();
    // "test.docx" appears both in the file list and the processing status
    const matches = screen.getAllByText('test.docx');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('disables process button when processing', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ];

    const { container } = render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={true}
        processingStatus={{ current: 1, total: 2, currentFile: 'test.docx' }}
        mode="teacher"
      />
    );

    const processButton = container.querySelector('button[disabled]');
    expect(processButton).toBeDefined();
    expect(processButton).not.toBeNull();
  });

  it('renders file names in the file list', async () => {
    const FileUpload = await getFileUpload();
    const mockFiles = [
      new File(['content'], 'skyrsla1.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      new File(['content'], 'skyrsla2.pdf', { type: 'application/pdf' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={() => {}}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    expect(screen.getByText('skyrsla1.docx')).toBeDefined();
    expect(screen.getByText('skyrsla2.pdf')).toBeDefined();
  });

  it('calls onProcess when process button is clicked', async () => {
    const FileUpload = await getFileUpload();
    const onProcess = vi.fn();
    const mockFiles = [
      new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ];

    render(
      <FileUpload
        files={mockFiles}
        onFilesSelected={() => {}}
        onProcess={onProcess}
        processing={false}
        processingStatus={{ current: 0, total: 0, currentFile: '' }}
        mode="teacher"
      />
    );

    fireEvent.click(screen.getByText('Greina skýrslur'));

    expect(onProcess).toHaveBeenCalledTimes(1);
  });
});
