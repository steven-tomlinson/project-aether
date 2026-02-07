import React, { useState, useEffect } from 'react';
import LibraryShelf from './components/LibraryShelf';
import BookReader from './components/BookReader';
import { LIBRARY_MANIFEST } from './constants';
import { BookManifest, User } from './types';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { uploadBook } from './src/api';

function App() {
  const [selectedBook, setSelectedBook] = useState<BookManifest | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
    // Request scope for reading files (future proofing for "Ingest" feature)
    scope: 'https://www.googleapis.com/auth/drive.readonly profile email' 
  });

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

  const [books, setBooks] = useState<BookManifest[]>(LIBRARY_MANIFEST);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!user) {
        alert("Authentication required.");
        return;
    }
    
    setIsUploading(true);
    try {
        const newBook = await uploadBook(file);
        setBooks(prev => [...prev, newBook]);
        alert(`INGESTION COMPLETE: ${newBook.title}`);
    } catch (error) {
        console.error("Ingestion failed", error);
        alert("INGESTION ERROR: Failed to process text cartridge.");
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
          onUpload={handleUpload}
          user={user}
          onLogin={() => login()} // Trigger the Google Login hook
          onMockLogin={handleMockLogin} // Trigger the Simulation Login
          onLogout={handleLogout}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}

export default App;