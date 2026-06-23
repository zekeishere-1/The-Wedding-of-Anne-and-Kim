/**
 * AudioManager Class
 * Handles low-latency RAM-cached sound execution using the Web Audio API
 */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.buffers = { paper: null }; 
        this.bgMusicSource = null;
        this.bgMusicGain = null;
        this.isUnlocked = false;
    }

    /**
     * Initializes the Web Audio API context safely upon user interaction
     */
    async init() {
        if (this.isUnlocked) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Load the paper flick sound straight into RAM memory
        await this._loadToRAM('audio/paper_shuffle.mp3', 'paper');

        this.isUnlocked = true;
        
        // Start the beautiful background music ambiance
        this._startBGMusic('audio/BeautifulSoul.mp3');
    }

    /**
     * Internal helper to fetch and decode audio files directly into computer memory
     */
    async _loadToRAM(url, key) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.buffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (err) {
            console.error(`AudioManager memory cache error [${key}]:`, err);
        }
    }

    /**
     * Starts the subtle background music loop at a delicate volume
     */
    async _startBGMusic(url) {
        if (this.bgMusicSource) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const musicBuffer = await this.ctx.decodeAudioData(arrayBuffer);

            this.bgMusicSource = this.ctx.createBufferSource();
            this.bgMusicSource.buffer = musicBuffer;
            this.bgMusicSource.loop = true;

            // Soft mixing level so it acts as background whisper music
            this.bgMusicGain = this.ctx.createGain();
            this.bgMusicGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

            this.bgMusicSource.connect(this.bgMusicGain);
            this.bgMusicGain.connect(this.ctx.destination);
            this.bgMusicSource.start(0);
        } catch (err) {
            console.error("Background ambiance music failed to stream:", err);
        }
    }

    /**
     * Public handler for firing the instant tactile card flick asset
     */
    playInstant(key, volume = 1.0) {
        if (!this.isUnlocked || !this.buffers[key]) return;

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[key];

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
    }
}

// Export single global instance
const audioManager = new AudioManager();