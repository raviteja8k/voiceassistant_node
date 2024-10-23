class VoiceAssistant {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.setupRecognition();
        this.setupUI();
        this.loadVoices();
    }

    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.showTranscript(transcript);
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.setStatus('Error: ' + event.error);
        };
    }

    setupUI() {
        this.micButton = document.getElementById('micButton');
        this.statusElement = document.getElementById('status');
        this.transcriptElement = document.getElementById('transcript');
        this.responseElement = document.getElementById('response');

        this.micButton.addEventListener('click', () => this.toggleListening());
        this.updateUI();
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        this.synthesis.onvoiceschanged = () => {
            this.voices = this.synthesis.getVoices();
        };
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateUI() {
        this.micButton.classList.toggle('listening', this.isListening);
        this.setStatus(this.isListening ? 'Listening...' : 'Click the microphone to start');
    }

    setStatus(message) {
        this.statusElement.textContent = message;
    }

    showTranscript(text) {
        this.transcriptElement.textContent = text;
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voices.find(voice => voice.lang === 'en-US') || this.voices[0];
        this.synthesis.speak(utterance);
        this.responseElement.textContent = text;
    }

    async processCommand(command) {
        command = command.toLowerCase();
        let response = '';

        if (command.includes('time')) {
            const time = new Date().toLocaleTimeString();
            response = `The current time is ${time}`;
        } else if (command.includes('date')) {
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            response = `Today is ${date}`;
        } else if (command.includes('news')) {
            try {
                const newsResponse = await fetch('https://api.spaceflightnewsapi.net/v3/articles?_limit=1');
                const data = await newsResponse.json();
                if (data && data.length > 0) {
                    response = `Latest news: ${data[0].title}`;
                }
            } catch (error) {
                response = "Sorry, I couldn't fetch the news at the moment";
            }
        } else if (command.includes('hello') || command.includes('hi')) {
            const responses = ["Hello!", "Hi there!", "Greetings!"];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else {
            response = "I'm not sure how to help with that. Try commands like 'time', 'date', 'news', or 'hello'";
        }

        this.speak(response);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    new VoiceAssistant();
});