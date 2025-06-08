document.addEventListener('DOMContentLoaded', async function() {
    const audioPlayer = document.getElementById('audio-player');
    const currentSongDisplay = document.getElementById('current-song');
    const progressContainer = document.getElementById('progress-container');
    const progress = document.getElementById('progress');
    let musicFiles = [];
    let currentSongIndex = 0;
    const folderPath = '../media/music'; // Path to the folder containing music files

    // Fetch list of songs from the folder dynamically
    async function fetchSongs() {
        try {
            const response = await fetch(`${folderPath}/`);
            if (!response.ok) {
                throw new Error(`Failed to fetch song list: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = Array.from(doc.querySelectorAll('a[href]'))
                .map(link => decodeURIComponent(link.getAttribute('href')))
                .filter(href => href.endsWith('.mp3'))
                .map(href => `${folderPath}/${href}`); // Add the folder path back
            console.log('Fetched songs:', links); // Log the fetched songs
            return links;
        } catch (error) {
            console.error('Error fetching songs:', error);
            currentSongDisplay.textContent = 'Error loading playlist. Check console.';
            return [];
        }
    }

    musicFiles = await fetchSongs();

    if (musicFiles.length === 0) {
        console.warn('No music files found.  Check the music folder and the fetchSongs function.');
        currentSongDisplay.textContent = 'No music files found.';
        return; // Stop execution if no files are found
    }

    function playSong(index) {
        audioPlayer.src = musicFiles[index];
        audioPlayer.load(); // Load the new source
        currentSongDisplay.textContent = 'Now Playing: ' + musicFiles[index].split('/').pop();
        currentSongIndex = index;
    }

    function shufflePlaylist() {
        for (let i = musicFiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [musicFiles[i], musicFiles[j]] = [musicFiles[j], musicFiles[i]];
        }
    }

    shufflePlaylist();
    playSong(currentSongIndex);

    // Attempt to play after loading
    audioPlayer.addEventListener('canplaythrough', function() {
        audioPlayer.play().catch(error => {
            console.error("Autoplay prevented:", error);
            currentSongDisplay.textContent = "Autoplay prevented. Please interact with the page.";
        });
    });

    audioPlayer.addEventListener('timeupdate', function() {
        if (audioPlayer.duration > 0) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = `${progressPercent}%`;
        }
    });

    progressContainer.addEventListener('click', function(event) {
        const width = this.clientWidth;
        const clickX = event.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    });

    audioPlayer.addEventListener('ended', function() {
        currentSongIndex = (currentSongIndex + 1) % musicFiles.length;
        playSong(currentSongIndex);
    });
});
