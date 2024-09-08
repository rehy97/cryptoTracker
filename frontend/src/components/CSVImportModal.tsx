import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import binance from '../img/binance-logo.webp';
import coinbase from '../img/coinbase-logo.webp';
import kucoin from '../img/kucoin-logo.webp';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ open, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5221/api/transaction/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);
      // Handle successful import
      onImport(file);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while importing the file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Import CSV
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          <Typography variant="h6" gutterBottom>
            Select a CSV file to import
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isDragActive ? 'Drop the file here' : 'or drag and drop it here'}
          </Typography>
          {selectedFile && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          We support CSV files from the following exchanges:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
          {[binance, coinbase, kucoin].map((tool, index) => (
            <img
              key={index}
              src={tool}
              alt={`Exchange ${index + 1}`}
              style={{ width: 40, height: 40 }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          onClick={() => selectedFile && handleImport(selectedFile)}
          variant="contained"
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVImportModal;