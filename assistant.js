class VoiceAssistant {
    constructor() {
        // Initialize speech recognition and synthesis
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.isListening = false; // Track listening state
        this.setupRecognition(); // Set up speech recognition
        this.setupUI(); // Set up user interface elements
        this.loadVoices(); // Load available speech synthesis voices
    }

    setupRecognition() {
        // Configure speech recognition settings
        this.recognition.continuous = false; // Stop after one result
        this.recognition.interimResults = false; // No interim results
        this.recognition.lang = 'en-US'; // Set language to English

        // Event handler for when recognition starts
        this.recognition.onstart = () => {
            this.isListening = true; // Update listening state
            this.updateUI(); // Update UI to reflect listening state
        };

        // Event handler for when recognition ends
        this.recognition.onend = () => {
            this.isListening = false; // Update listening state
            this.updateUI(); // Update UI to reflect listening state
        };

        // Event handler for when a result is received
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript; // Get the recognized text
            this.showTranscript(transcript); // Display the transcript
            this.processCommand(transcript); // Process the recognized command
        };

        // Event handler for recognition errors
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error); // Log error
            this.setStatus('Error: ' + event.error); // Update status with error message
        };
    }

    setupUI() {
        // Get UI elements
        this.micButton = document.getElementById('micButton');
        this.statusElement = document.getElementById('status');
        this.transcriptElement = document.getElementById('transcript');
        this.responseElement = document.getElementById('response');

        // Add click event listener to the microphone button
        this.micButton.addEventListener('click', () => this.toggleListening());
        this.updateUI(); // Initial UI update
    }

    loadVoices() {
        // Load available voices for speech synthesis
        this.voices = this.synthesis.getVoices();
        this.synthesis.onvoiceschanged = () => {
            this.voices = this.synthesis.getVoices(); // Update voices when they change
        };
    }

    toggleListening() {
        // Start or stop listening based on current state
        if (this.isListening) {
            this.recognition.stop(); // Stop recognition
        } else {
            this.recognition.start(); // Start recognition
        }
    }

    updateUI() {
        // Update UI elements based on listening state
        this.micButton.classList.toggle('listening', this.isListening); // Toggle listening class
        this.setStatus(this.isListening ? 'Listening...' : 'Click the microphone to start'); // Update status message
    }

    setStatus(message) {
        // Update the status element with a message
        this.statusElement.textContent = message;
    }

    showTranscript(text) {
        // Display the recognized transcript
        this.transcriptElement.textContent = text;
    }

    speak(text) {
        // Create a speech synthesis utterance and speak the text
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voices.find(voice => voice.lang === 'en-US') || this.voices[0]; // Select voice
        this.synthesis.speak(utterance); // Speak the text
        this.responseElement.textContent = text; // Display the spoken text
    }

    async processCommand(command) {
        // Process the recognized command and generate a response
        command = command.toLowerCase(); // Convert command to lowercase
        let response = '';

        // Check for specific commands and generate appropriate responses
        if (command.includes('time')) {
            const time = new Date().toLocaleTimeString(); // Get current time
            response = `The current time is ${time}`; // Prepare response
        } else if (command.includes('date')) {
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }); // Get current date
            response = `Today is ${date}`; // Prepare response
        } else if (command.includes('news')) {
            try {
                const newsResponse = await fetch('https://api.spaceflightnewsapi.net/v3/articles?_limit=1'); // Fetch latest news
                const data = await newsResponse.json(); // Parse JSON response
                if (data && data.length > 0) {
                    response = `Latest news: ${data[0].title}`; // Prepare response with news title
                }
            } catch (error) {
                response = "Sorry, I couldn't fetch the news at the moment"; // Handle fetch error
            }
        } else if (command.includes('hello') || command.includes('hi')) {
            const responses = ["Hello!", "Hi there!", "Greetings!"]; // Possible greetings
            response = responses[Math.floor(Math.random() * responses.length)]; // Randomly select a greeting
        } else if (command.includes('weather')) {
            // Extract city name from the command
            const cityMatch = command.match(/weather in (\w+)/);
            const city = cityMatch ? cityMatch[1] : 'London'; // Default to Hyderabad if no city is specified

            try {
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=1c58dc53bb5637c46b636c4b1a4d6c02&units=metric`); // Fetch weather data
                const data = await weatherResponse.json(); // Parse JSON response
                if (data && data.main) {
                    const temperature = data.main.temp; // Get temperature
                    const weatherDescription = data.weather[0].description; // Get weather description
                    response = `The current temperature in ${city} is ${temperature}°C with ${weatherDescription}.`; // Prepare response
                } else {
                    response = "Sorry, I couldn't find the weather for that location."; // Handle case where city is not found
                }
            } catch (error) {
                response = "Sorry, I couldn't fetch the weather at the moment"; // Handle fetch error
            }
        } else if (command.includes('open')) {
            // Extract the site name from the command
            const siteMatch = command.match(/open (.+)/);
            const siteName = siteMatch ? siteMatch[1].trim() : ''; // Get the site name

            if (siteName) {
                const url = `https://${siteName}.com`; // Construct the URL
                window.open(url, '_blank'); // Open the site in a new tab
                response = `Opening ${siteName} in a new tab.`; // Prepare response
            } else {
                response = "Please specify a site name to open."; // Handle case where no site name is provided
            }
        } else {
            response = "I'm not sure how to help with that. Try commands like 'time', 'date', 'news', or 'hello'"; // Default response
        }

        this.speak(response); // Speak the generated response
    }
}

// Initialize the VoiceAssistant when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission(); // Request notification permission if not granted
    }
    new VoiceAssistant(); // Create a new instance of VoiceAssistant
});
