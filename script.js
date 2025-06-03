
    class MediaPlayer {
  constructor() {
    this.videoPlayer = document.getElementById('videoPlayer');
    this.audioVisualizer = document.getElementById('audioVisualizer');
    this.mediaFile = document.getElementById('mediaFile');
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.muteBtn = document.getElementById('muteBtn');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.progressBar = document.getElementById('progressBar');
    this.progressFill = document.getElementById('progressFill');
    this.currentTimeEl = document.getElementById('currentTime');
    this.durationEl = document.getElementById('duration');
    this.fileName = document.getElementById('fileName');
    this.fileSize = document.getElementById('fileSize');
    this.fileType = document.getElementById('fileType');
    this.fileDuration = document.getElementById('fileDuration');
    this.mediaInfo = document.getElementById('mediaInfo');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');

    this.playlist = [];
    this.currentIndex = 0;
    this.currentMedia = null;
    this.isMuted = false;

    this.init();
  }

  init() {
    this.setVolume(50);
    this.mediaFile.addEventListener('change', (e) => this.loadPlaylist(e));
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.muteBtn.addEventListener('click', () => this.toggleMute());
    this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    this.progressBar.addEventListener('click', (e) => this.seek(e));
    document.addEventListener('keydown', (e) => this.keyboardControls(e));
    this.nextBtn.addEventListener('click', () => this.nextMedia());
    this.prevBtn.addEventListener('click', () => this.prevMedia());
  }

  loadPlaylist(e) {
    this.playlist = Array.from(e.target.files);
    this.currentIndex = 0;
    this.loadMedia(this.currentIndex);
  }

  loadMedia(index) {
    const file = this.playlist[index];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    if (this.currentMedia) {
      this.currentMedia.pause();
      if (this.currentMedia.tagName !== 'VIDEO') {
        this.currentMedia.remove();
      }
    }

    if (isVideo) {
      this.currentMedia = this.videoPlayer;
      this.videoPlayer.src = url;
      this.videoPlayer.style.display = 'block';
      this.audioVisualizer.style.display = 'none';
    } else {
      this.currentMedia = new Audio(url);
      this.videoPlayer.style.display = 'none';
      this.audioVisualizer.style.display = 'flex';
      this.updateAudioVisualizer(file.name);
    }

    this.setVolume(this.volumeSlider.value);
    this.updateMediaInfo(file);
    this.setupMediaEvents();
  }

  setupMediaEvents() {
    const media = this.currentMedia;

    media.addEventListener('loadedmetadata', () => {
      this.durationEl.textContent = this.formatTime(media.duration);
      this.fileDuration.textContent = `Duration: ${this.formatTime(media.duration)}`;
    });

    media.addEventListener('timeupdate', () => this.updateProgress());

    media.addEventListener('play', () => {
      this.playPauseBtn.textContent = '⏸';
    });

    media.addEventListener('pause', () => {
      this.playPauseBtn.textContent = '▶';
    });

    media.addEventListener('ended', () => {
      this.nextMedia();
    });
  }

  togglePlayPause() {
    if (!this.currentMedia) return;
    this.currentMedia.paused ? this.currentMedia.play() : this.currentMedia.pause();
  }

  toggleMute() {
    if (!this.currentMedia) return;
    if (this.isMuted) {
      this.setVolume(this.volumeSlider.value);
      this.muteBtn.textContent = '🔊';
    } else {
      this.currentMedia.volume = 0;
      this.muteBtn.textContent = '🔇';
    }
    this.isMuted = !this.isMuted;
  }

  setVolume(val) {
    if (this.currentMedia) {
      this.currentMedia.volume = val / 100;
    }
    this.muteBtn.textContent = val == 0 ? '🔇' : val < 50 ? '🔉' : '🔊';
  }

  updateProgress() {
    const percent = (this.currentMedia.currentTime / this.currentMedia.duration) * 100;
    this.progressFill.style.width = percent + '%';
    this.currentTimeEl.textContent = this.formatTime(this.currentMedia.currentTime);
  }

  seek(e) {
    if (!this.currentMedia) return;
    const rect = this.progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.currentMedia.currentTime = percent * this.currentMedia.duration;
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  updateMediaInfo(file) {
    this.fileName.textContent = file.name;
    this.fileSize.textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    this.fileType.textContent = `Type: ${file.type}`;
    this.mediaInfo.classList.add('active');
  }

  updateAudioVisualizer(name) {
    this.audioVisualizer.querySelector('.audio-title').textContent = name;
  }

  nextMedia() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.loadMedia(this.currentIndex);
    }
  }

  prevMedia() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadMedia(this.currentIndex);
    }
  }

  keyboardControls(e) {
    if (!this.currentMedia) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.togglePlayPause();
        break;
      case 'KeyM':
        this.toggleMute();
        break;
      case 'ArrowLeft':
        this.currentMedia.currentTime -= 10;
        break;
      case 'ArrowRight':
        this.currentMedia.currentTime += 10;
        break;
      case 'ArrowUp':
        e.preventDefault();
        let up = Math.min(100, parseInt(this.volumeSlider.value) + 10);
        this.volumeSlider.value = up;
        this.setVolume(up);
        break;
      case 'ArrowDown':
        e.preventDefault();
        let down = Math.max(0, parseInt(this.volumeSlider.value) - 10);
        this.volumeSlider.value = down;
        this.setVolume(down);
        break;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new MediaPlayer());