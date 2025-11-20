document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:4000";

  //login
  const authContainer = document.getElementById("auth-container");
  if (authContainer) {
    const actionBtn = document.getElementById("login-btn");
    const toggleForm = document.getElementById("toggle-form");

    toggleForm.addEventListener("click", () => {
      const isLogin = document.getElementById("form-title").textContent === "Login";
      document.getElementById("form-title").textContent = isLogin ? "Sign Up" : "Login";
      actionBtn.textContent = isLogin ? "Sign Up" : "Login";
      toggleForm.textContent = isLogin ? "Already have an account? Login" : "Don't have an account? Sign up";
    });

    actionBtn.addEventListener("click", async () => {
      const isLogin = document.getElementById("form-title").textContent === "Login";
      const endpoint = isLogin ? '/login' : '/signup';
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      if (!username || !password) return alert('Please enter credentials.');

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.success) {
          if (data.token) {
            localStorage.setItem('jwt_token', data.token);
          }
          alert(data.message);
          window.location.href = "home.html";
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    });
  }

  //home
  const homeContainer = document.getElementById("home-container");
  if (homeContainer) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert("You are not logged in. Redirecting...");
      window.location.href = 'login.html';
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      document.getElementById('username-display').textContent = payload.username;
    } catch (e) {
      console.error("Could not decode token", e);
    }

    let currentSong = null;
    let isPlaying = false;

    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const contentPlaceholder = document.querySelector(".content-placeholder");
    const audioPlayer = document.getElementById("audio-player");
    const nowPlaying = document.getElementById("now-playing");
    const albumCover = document.getElementById("album-cover");
    const playBtn = document.getElementById("play-btn");
    const playBtnIcon = playBtn.querySelector("i");
    const likeBtn = document.getElementById("like-btn");
    const likeBtnIcon = likeBtn.querySelector("i");
    const libraryBtn = document.getElementById("library-btn");
    const homeBtn = document.getElementById("home-btn");

    async function streamSong(query, videoId) {
      nowPlaying.textContent = `Searching...`;
      albumCover.src = 'default_cover.png';
      likeBtnIcon.className = 'far fa-heart';

      try {
        const requestBody = {
          url: videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : `ytsearch1:${query}`
        };
        const response = await fetch(`${API_URL}/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        currentSong = {
          videoId: data.videoId,
          title: data.title,
          artist: data.artist,
          thumbnail: data.thumbnail,
        };

        audioPlayer.src = data.audioUrl;
        nowPlaying.textContent = `${currentSong.title} - ${currentSong.artist}`;
        albumCover.src = currentSong.thumbnail || 'default_cover.png';
        audioPlayer.play();
      } catch (err) {
        console.error("Error streaming song:", err);
        nowPlaying.textContent = `Failed to load song.`;
      }
    }

    async function displayLikedSongs() {
      contentPlaceholder.innerHTML = `<p class="loading-text">Loading your library...</p>`;
      try {
        const response = await fetch(`${API_URL}/liked-songs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        contentPlaceholder.innerHTML = "<h2>Your Liked Songs</h2>";
        if (data.songs.length === 0) {
          contentPlaceholder.innerHTML += "<p>You haven't liked any songs yet.</p>";
          return;
        }

        const songList = document.createElement('div');
        songList.className = 'search-results-container';
        data.songs.forEach((song) => {
          const songCard = document.createElement('div');
          songCard.className = 'song-card';
          songCard.dataset.videoId = song.video_id;
          songCard.innerHTML = `
            <img src="${song.thumbnail_url || 'default_cover.png'}" style="width:50px; height:50px; border-radius:4px; object-fit:cover;">
            <div class="song-card-info">
              <h3>${song.title}</h3>
              <p>${song.artist}</p>
            </div>`;
          songList.appendChild(songCard);
        });
        contentPlaceholder.appendChild(songList);

        songList.addEventListener("click", (e) => {
          const card = e.target.closest(".song-card");
          if (card && card.dataset.videoId) {
            streamSong(null, card.dataset.videoId);
          }
        });
      } catch (err) {
        console.error("Could not fetch liked songs:", err);
        contentPlaceholder.innerHTML = "<p>Could not load your library.</p>";
      }
    }

    
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      streamSong(searchInput.value.trim(), null);
    });

    playBtn.addEventListener("click", () => {
      if (!audioPlayer.src) return;
      if (isPlaying) audioPlayer.pause();
      else audioPlayer.play();
    });

    likeBtn.addEventListener("click", async () => {
      if (!currentSong) return alert("No song is currently playing.");
      try {
        const response = await fetch(`${API_URL}/like-song`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(currentSong),
        });
        const data = await response.json();
        if (data.success) {
          likeBtnIcon.className = 'fas fa-heart';
        } else {
          alert("Failed to like song: " + data.message);
        }
      } catch (err) {
        console.error("Error liking song:", err);
      }
    });

    libraryBtn.addEventListener("click", () => {
      homeBtn.classList.remove("active");
      libraryBtn.classList.add("active");
      displayLikedSongs();
    });

    homeBtn.addEventListener("click", () => {
      libraryBtn.classList.remove("active");
      homeBtn.classList.add("active");
      contentPlaceholder.innerHTML = `
        <h2>Your music awaits</h2>
        <p>Use the search bar above to find and play any song.</p>
      `;
    });

    audioPlayer.onplay = () => {
      isPlaying = true;
      playBtnIcon.className = "fa fa-pause";
    };
    audioPlayer.onpause = () => {
      isPlaying = false;
      playBtnIcon.className = "fa fa-play";
    };

  
  }
});
