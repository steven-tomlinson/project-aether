import axios from 'axios';
import { BookManifest } from './types';

const API_URL = 'http://localhost:8000/api';

export const uploadBook = async (file: File): Promise<BookManifest> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/ingest`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
