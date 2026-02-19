import React, { useState } from 'react';
import { Upload, CheckCircle, RotateCcw } from 'lucide-react';
import { ProcessingStatus } from '@/types';
import { getFileTypeDescription } from '@/utils/fileProcessing';

interface FileUploadProps {
  files: File[];
  onFilesSelected: (files: File[]) => void;
  onProcess: () => void;
  processing: boolean;
  processingStatus: ProcessingStatus;
  acceptedFileTypes?: string;
  mode?: 'teacher' | 'student';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesSelected,
  onProcess,
  processing,
  processingStatus,
  acceptedFileTypes = '.docx,.pdf,image/*',
  mode = 'teacher',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    onFilesSelected(selectedFiles);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Only set dragging to false if leaving the drop zone itself
    if (event.currentTarget === event.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);

    // Filter files based on accepted types
    const validFiles = droppedFiles.filter(file => {
      if (acceptedFileTypes.includes('image/*') && file.type.startsWith('image/')) {
        return true;
      }
      if (acceptedFileTypes.includes('.docx') && file.name.endsWith('.docx')) {
        return true;
      }
      if (acceptedFileTypes.includes('.pdf') && file.name.endsWith('.pdf')) {
        return true;
      }
      return false;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const isStudentMode = mode === 'student';
  const title = isStudentMode ? 'Veldu skrá' : 'Hladdu upp skýrslum';
  const description = isStudentMode
    ? 'Word skjal (.docx), PDF skrá (.pdf) eða mynd (JPEG, PNG)'
    : 'Word skjöl (.docx), PDF skrár (.pdf) eða myndir - margar í einu';
  const buttonText = isStudentMode ? 'Fá endurgjöf á drögin' : 'Greina skýrslur';

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          isDragging
            ? 'border-kvenno-orange bg-orange-50'
            : 'border-slate-300 bg-white'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload
          className={`mx-auto mb-4 ${isDragging ? 'text-kvenno-orange' : 'text-slate-600'}`}
          size={48}
        />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {isDragging ? 'Slepptu skrá' + (isStudentMode ? '' : 'm') + ' hér' : title}
        </h3>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <input
          type="file"
          accept={acceptedFileTypes}
          multiple={!isStudentMode}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-kvenno-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition cursor-pointer inline-block"
        >
          Velja skrá{isStudentMode ? '' : 'r'}
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">
            {files.length} skrá{files.length !== 1 ? 'r' : ''} valin{files.length !== 1 ? 'ar' : ''}
          </h3>
          <div className="space-y-2 mb-4">
            {files.map((file, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded flex items-center gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 truncate">{file.name}</div>
                  <div className="text-xs text-slate-500">{getFileTypeDescription(file)}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onProcess}
            disabled={processing}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
          >
            {processing ? (
              <>
                <RotateCcw className="animate-spin" size={24} />
                <div className="text-left">
                  <div>
                    Vinn úr skýrslum... ({processingStatus.current}/{processingStatus.total})
                  </div>
                  {processingStatus.currentFile && (
                    <div className="text-sm font-normal">{processingStatus.currentFile}</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <CheckCircle size={24} />
                {buttonText}
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};
