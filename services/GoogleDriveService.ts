
import axios from 'axios';
import { BookManifest } from '../types';

const DRIVE_API = import.meta.env.DEV ? '/api/drive' : 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';

export class GoogleDriveService {
  private token: string;
  private folderId: string | null = null;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async initLibrary(): Promise<string> {
    const timestamp = new Date().getTime();
    const uniqueName = 'Project Aether Archive';
    try {
      // Search for existing folder with the UNIQUE name
      const search = await axios.get(`${DRIVE_API}/files`, {
        headers: this.headers,
        params: {
          q: `name = '${uniqueName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name)"
        }
      });

      if (search.data.files.length > 0) {
        this.folderId = search.data.files[0].id;
        console.log(`G-DRIVE_INIT: Found archive ${this.folderId} (${uniqueName})`);
        return this.folderId!;
      }

      // Create if not exists (Use a unique name to avoid 403 from old project folders)
      const create = await axios.post(`${DRIVE_API}/files`, {
        name: uniqueName,
        mimeType: 'application/vnd.google-apps.folder'
      }, { headers: this.headers });

      this.folderId = create.data.id;
      console.log(`G-DRIVE_INIT: Created archives at ${this.folderId} (${uniqueName})`);
      return this.folderId!;
    } catch (error: any) {
      console.error("G-DRIVE_INIT_ERROR:", JSON.stringify(error.response?.data || error.message, null, 2));
      throw error;
    }
  }

  async getCatalog(): Promise<BookManifest[]> {
    if (!this.folderId) await this.initLibrary();

    try {
      const search = await axios.get(`${DRIVE_API}/files`, {
        headers: this.headers,
        params: {
          q: `name = '_catalog.json' and '${this.folderId}' in parents and trashed = false`,
          fields: "files(id, name)"
        }
      });

      if (search.data.files.length === 0) return [];

      const fileId = search.data.files[0].id;
      const content = await axios.get(`${DRIVE_API}/files/${fileId}?alt=media`, {
        headers: this.headers
      });

      return content.data as BookManifest[];
    } catch (error: any) {
      console.error("G-DRIVE_GET_CATALOG_ERROR:", error.response?.data || error.message);
      return [];
    }
  }

  async listPublicFolder(folderId: string, apiKey: string): Promise<any[]> {
    try {
      const response = await axios.get(`${DRIVE_API}/files`, {
        params: {
          q: `'${folderId}' in parents and trashed = false`,
          key: apiKey,
          fields: "files(id, name, mimeType)"
        }
      });
      return response.data.files;
    } catch (error: any) {
      console.error("G-DRIVE_LIST_PUBLIC_ERROR:", error.response?.data || error.message);
      return [];
    }
  }

  async getFileContent(fileId: string, apiKey: string): Promise<any | null> {
    try {
      const response = await axios.get(`${DRIVE_API}/files/${fileId}`, {
        params: {
          alt: 'media',
          key: apiKey
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`G-DRIVE_GET_CONTENT_ERROR [${fileId}]:`, error.response?.data || error.message);
      return null;
    }
  }

  async saveCatalog(books: BookManifest[]): Promise<string> {
    if (!this.folderId) await this.initLibrary();

    const catalogContent = JSON.stringify(books, null, 2);

    try {
      const search = await axios.get(`${DRIVE_API}/files`, {
        headers: this.headers,
        params: {
          q: `name = '_catalog.json' and '${this.folderId}' in parents and trashed = false`,
          fields: "files(id)"
        }
      });

      const fileMetadata = {
        name: '_catalog.json',
        mimeType: 'application/json',
        parents: [this.folderId!]
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', new Blob([catalogContent], { type: 'application/json' }));

      if (search.data.files.length > 0) {
        const fileId = search.data.files[0].id;
        console.log(`G-DRIVE_SYNC: Patching catalog ${fileId}`);
        await axios.patch(`${UPLOAD_API}/${fileId}?uploadType=multipart`, formData, {
          headers: this.headers
        });
        return fileId;
      } else {
        console.log("G-DRIVE_SYNC: Posting fresh catalog");
        const response = await axios.post(`${UPLOAD_API}?uploadType=multipart`, formData, {
          headers: this.headers
        });
        return response.data.id;
      }
    } catch (error: any) {
      console.error("G-DRIVE_SAVE_CATALOG_ERROR:", JSON.stringify(error.response?.data || error.message, null, 2));
      throw error;
    }
  }

  async saveBook(book: BookManifest): Promise<string> {
    if (!this.folderId) await this.initLibrary();

    try {
      const search = await axios.get(`${DRIVE_API}/files`, {
        headers: this.headers,
        params: {
          q: `name='${book.id}.json' and '${this.folderId}' in parents and trashed=false`,
          fields: "files(id)"
        }
      });

      const fileMetadata = {
        name: `${book.id}.json`,
        mimeType: 'application/json',
        parents: [this.folderId!]
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', new Blob([JSON.stringify(book, null, 2)], { type: 'application/json' }));

      if (search.data.files.length > 0) {
        const fileId = search.data.files[0].id;
        console.log(`G-DRIVE_SAVE: Updating volume ${book.id}`);
        await axios.patch(`${UPLOAD_API}/${fileId}?uploadType=multipart`, formData, {
          headers: this.headers
        });
        return fileId;
      } else {
        console.log(`G-DRIVE_SAVE: Creating volume ${book.id}`);
        const response = await axios.post(`${UPLOAD_API}?uploadType=multipart`, formData, {
          headers: this.headers
        });
        return response.data.id;
      }
    } catch (error: any) {
      console.error(`G-DRIVE_SAVE_ERROR [${book.id}]:`, JSON.stringify(error.response?.data || error.message, null, 2));
      throw error;
    }
  }
}
