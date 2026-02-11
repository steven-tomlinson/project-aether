import React, { useState, useEffect } from 'react';
import LibraryShelf from './components/LibraryShelf';
import BookReader from './components/BookReader';
import { STARTER_MANIFEST_ID, GOOGLE_API_KEY } from './constants';
import { BookManifest, User } from './types';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { uploadBook } from './src/api';
import { GoogleDriveService } from './services/GoogleDriveService';
import SeedingControls from './components/SeedingControls';

function App() {
  const [selectedBook, setSelectedBook] = useState<BookManifest | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [driveService, setDriveService] = useState<GoogleDriveService | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const [starterBooks, setStarterBooks] = useState<BookManifest[]>([]);
  const [userBooks, setUserBooks] = useState<BookManifest[]>([]);
  const [books, setBooks] = useState<BookManifest[]>([]);

  // 1. Load Starter Library (Public)
  useEffect(() => {
    const loadStarterLibrary = async () => {
      if (!STARTER_MANIFEST_ID || !GOOGLE_API_KEY) {
        console.warn("Missing VITE_STARTER_FOLDER_ID or VITE_GOOGLE_API_KEY");
        return;
      }

      console.log("LOADING_STARTER_LIBRARY...");
      const service = new GoogleDriveService(""); // No token needed for public
      try {
        const files = await service.listPublicFolder(STARTER_MANIFEST_ID, GOOGLE_API_KEY);
        console.log(`FOUND ${files.length} STARTER MANIFESTS`);

        const loadedBooks: BookManifest[] = [];
        await Promise.all(files.map(async (file: any) => {
          // Basic check if it looks like a manifest file (JSON)
          if (file.mimeType === 'application/json' && !file.name.startsWith('_')) {
            const content = await service.getFileContent(file.id, GOOGLE_API_KEY);
            if (content && content.id) {
              loadedBooks.push(content);
            }
          }
        }));

        console.log(`LOADED ${loadedBooks.length} STARTER BOOKS`);
        setStarterBooks(loadedBooks);
      } catch (err) {
        console.error("FAILED_TO_LOAD_STARTER", err);
      }
    };

    loadStarterLibrary();
  }, []);

  // 2. Merge Libraries
  useEffect(() => {
    // Combine unique books. User books overwrite starter books if IDs match (optional, but good for progression)
    // For now, simple concatenation, filtering duplicates by ID
    const combined = [...starterBooks];
    userBooks.forEach(ub => {
      if (!combined.find(cb => cb.id === ub.id)) {
        combined.push(ub);
      }
    });
    setBooks(combined);
  }, [starterBooks, userBooks]);

  // Persist User Session
  useEffect(() => {
    const storedUser = localStorage.getItem('aether_user_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem('aether_user_session');
      }
    }
  }, []);

  // REAL Google Login Implementation
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("OAUTH_SUCCESS: ACCESS_TOKEN_RECEIVED", tokenResponse);
      try {
        // Fetch User Profile info using the access token
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const googleProfile = userInfo.data;

        const authenticatedUser: User = {
          id: googleProfile.sub,
          name: googleProfile.name,
          email: googleProfile.email,
          avatarUrl: googleProfile.picture,
          token: tokenResponse.access_token // Store access token for future API calls (Drive, etc.)
        };

        setUser(authenticatedUser);
        localStorage.setItem('aether_user_session', JSON.stringify(authenticatedUser));
        console.log(`IDENTITY_VERIFIED: ${authenticatedUser.email}`);

      } catch (error) {
        console.error("FAILED_TO_FETCH_PROFILE", error);
        alert("LOGIN ERROR: Failed to retrieve user identity.");
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      alert(`AUTH_FAILURE: ${error.error_description || "Connection to Identity Provider failed."}`);
    },
    // Explicitly set flow to implicit to avoid confusion in dynamic environments
    flow: 'implicit',
    // Request scope for reading files and App Data (for Library persistence)
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.metadata.readonly profile email'
  });

  // Init Drive Service when User & Token are ready
  useEffect(() => {
    if (user?.token) {
      const service = new GoogleDriveService(user.token);
      setDriveService(service);

      // Initial Sync
      const syncLibrary = async () => {
        setSyncStatus('syncing');
        try {
          const cloudCatalog = await service.getCatalog();
          if (cloudCatalog.length > 0) {
            console.log(`CLOUD_SYNC: Restored ${cloudCatalog.length} volumes.`);
            setUserBooks(cloudCatalog);
          } else {
            console.log("CLOUD_SYNC: Initializing fresh archive...");
            await service.saveCatalog([]);
          }
          setSyncStatus('synced');
        } catch (error) {
          console.error("CLOUD_SYNC_FAILED", error);
          setSyncStatus('error');
        }
      };
      syncLibrary();
    }
  }, [user?.token]);

  // MOCK Login / Guest Access for Preview Environments
  const handleMockLogin = () => {
    const mockUser: User = {
      id: "mock-user-001",
      name: "Guest Archivist",
      email: "guest@project-aether.local",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AetherGuest"
    };
    setUser(mockUser);
    localStorage.setItem('aether_user_session', JSON.stringify(mockUser));
    console.log(`SIMULATION_MODE_ACTIVE: ${mockUser.email}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aether_user_session');
    console.log("SESSION_TERMINATED");
  };

  const handleSelectBook = (book: BookManifest) => {
    console.log("Selected book:", book.title);
    setSelectedBook(book);
  };

  const handleCloseBook = () => {
    setSelectedBook(null);
  }


  const [isUploading, setIsUploading] = useState(false);
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);

  // Load Google API for Picker
  useEffect(() => {
    const loadGapi = () => {
      window.gapi.load('picker', () => {
        setPickerInited(true);
      });
    };

    // Check if script is loaded, if not wait for it
    if (window.gapi) {
      loadGapi();
    } else {
      const interval = setInterval(() => {
        if (window.gapi) {
          clearInterval(interval);
          loadGapi();
        }
      }, 500);
    }
  }, []);

  const handleDriveSelect = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const fileId = data.docs[0].id;
      const fileName = data.docs[0].name;
      const mimeType = data.docs[0].mimeType;
      const oauthToken = user?.token;

      if (!oauthToken) return;

      setIsUploading(true);
      try {
        console.log(`FETCHING_DRIVE_FILE: ${fileId} (${mimeType})`);

        let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

        // If it's a Google Doc, we must export it as text/plain
        if (mimeType === 'application/vnd.google-apps.document') {
          url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${oauthToken}` },
          responseType: 'blob' // Important: treat as blob/file
        });

        const file = new File([response.data], fileName, { type: 'text/plain' });

        // Send to Ingestion Engine
        const newBook = await uploadBook(file);

        const updatedBooks = [...userBooks, newBook];
        setUserBooks(updatedBooks);

        // Sync to Cloud
        if (driveService) {
          setSyncStatus('syncing');
          await driveService.saveBook(newBook); // Backup individual
          await driveService.saveCatalog(updatedBooks); // Update index
          setSyncStatus('synced');
        }

        alert(`INGESTION COMPLETE: ${newBook.title}`);

      } catch (error) {
        console.error("Drive Download Failed", error);
        alert("DRIVE ERROR: Failed to download text cartridge.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDriveIngest = () => {
    if (!user) {
      alert("Authentication required.");
      return;
    }

    if (!pickerInited || !user.token) {
      alert("System initializing... please wait or re-login.");
      return;
    }

    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    view.setMimeTypes("text/plain,application/vnd.google-apps.document");

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId("418202563769") // Project ID from config
      .setOAuthToken(user.token)
      .addView(view)
      .addView(new window.google.picker.DocsUploadView())
      .setCallback(handleDriveSelect)
      .build();

    picker.setVisible(true);
  };

  const handleLocalIngest = async (file: File) => {
    setIsUploading(true);
    try {
      const newBook = await uploadBook(file);
      const updatedBooks = [...userBooks, newBook];
      setUserBooks(updatedBooks);

      // Sync to Cloud
      if (driveService) {
        setSyncStatus('syncing');
        await driveService.saveBook(newBook);
        await driveService.saveCatalog(updatedBooks);
        setSyncStatus('synced');
      }

      alert(`INGESTION COMPLETE: ${newBook.title}`);
    } catch (error) {
      console.error("Local Upload Failed", error);
      alert("UPLOAD ERROR: Failed to ingest local cartridge.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="antialiased text-gray-900">
      {selectedBook ? (
        <BookReader book={selectedBook} user={user} onClose={handleCloseBook} />
      ) : (
        <LibraryShelf
          books={books}
          onSelectBook={handleSelectBook}
          onLocalIngest={handleLocalIngest}
          onDriveIngest={handleDriveIngest}
          user={user}
          onLogin={() => login()} // Trigger the Google Login hook
          onMockLogin={handleMockLogin} // Trigger the Simulation Login
          onLogout={handleLogout}
          isUploading={isUploading}
          syncStatus={syncStatus}
        />
      )}
      <SeedingControls driveService={driveService} sourceBooks={starterBooks} />
    </div>
  );
}

export default App;