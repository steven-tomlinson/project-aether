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
      console.log("LOADING_STARTER_LIBRARY (VIA PROXY)...");
      const service = new GoogleDriveService(""); // No token needed for public proxy
      try {
        const loadedBooks = await service.getPublicLibrary();
        console.log(`LOADED ${loadedBooks.length} STARTER BOOKS`);
        setStarterBooks(loadedBooks);

        if (loadedBooks.length === 0) {
          console.error("CRITICAL: NO BOOKS LOADED FROM PROXY.");
        }
      } catch (err: any) {
        console.error("FAILED_TO_LOAD_STARTER", err);
        alert("CRITICAL ERROR: Failed to load library from Backend. Check console.");
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
      const oauthToken = user?.token;
      if (!oauthToken) return;

      setIsUploading(true);
      try {
        // Process each picked file (supports MULTISELECT)
        for (const doc of data.docs) {
          const fileId = doc.id;
          const fileName = doc.name;
          const mimeType = doc.mimeType;

          console.log(`FETCHING_DRIVE_FILE: ${fileId} (${mimeType})`);

          // Determine download URL based on MIME type
          let url: string;
          const googleDocTypes = [
            'application/vnd.google-apps.document',
            'application/vnd.google-apps.spreadsheet',
            'application/vnd.google-apps.presentation',
          ];

          if (googleDocTypes.includes(mimeType)) {
            // Google native docs must be exported
            url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
          } else {
            // Regular files: direct download
            url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
          }

          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${oauthToken}` },
            responseType: 'blob'
          });

          const file = new File([response.data], fileName, { type: 'text/plain' });

          // Send to Ingestion Engine
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

          console.log(`INGESTION_COMPLETE: ${newBook.title}`);
        }

        alert(`INGESTION COMPLETE: ${data.docs.length} file(s) processed.`);

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

    // Primary view: My Drive with folder navigation enabled
    const myDriveView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    // Secondary view: All Drive documents (flat search)
    const allDocsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);

    // Upload view: Allow drag-and-drop uploads
    const uploadView = new window.google.picker.DocsUploadView();

    const picker = new window.google.picker.PickerBuilder()
      .setAppId("418202563769")
      .setOAuthToken(user.token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .addView(myDriveView)
      .addView(allDocsView)
      .addView(uploadView)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setCallback(handleDriveSelect)
      .setTitle("SELECT TEXT CARTRIDGE // PROJECT AETHER")
      .setSize(900, 600)
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