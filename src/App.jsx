import React, { useState, useEffect } from "react";

const CLIENT_ID = "YOUR_CLIENT_ID"; 
const REDIRECT_URI = "http://localhost:5173/callback"; 
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE = "user-read-playback-state user-read-currently-playing user-read-private";

function App() {
  const [token, setToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find(elem => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  useEffect(() => {
    if (token) {
      getUserInfo();
    }
  }, [token]);

  const getUserInfo = () => {
    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setUser(data);
      })
      .catch(err => console.error("Error fetching user info:", err));
  };

  const getCurrentlyPlaying = () => {
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setNowPlaying(data);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-white-500">
      {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
          className="text-white text-lg font-bold py-2 px-4 rounded-full bg-green-500 hover:bg-green-600 transition duration-300"
        >
          Login to Spotify
        </a>
      ) : (
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          {user && (
            <div className="mb-6">
              <div class="text-xl font-bold text-gray-800 mb-2">Logged in as</div>
              <img
                src={user.images[0]?.url}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">{user.display_name}</h2>
            </div>
          )}
          <button
            onClick={getCurrentlyPlaying}
            className="text-white font-bold py-2 px-4 mb-4 rounded-full bg-blue-500 hover:bg-blue-600 transition duration-300"
          >
            Now Playing
          </button>
          {nowPlaying && (
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-gray-800">{nowPlaying.item.name}</h3>
              <p className="text-lg text-gray-600">From {nowPlaying.item.artists[0].name}</p>
              <img
                src={nowPlaying.item.album.images[0].url}
                alt="Album Art"
                className="mt-4 w-48 h-48 rounded-lg shadow-lg mx-auto"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
