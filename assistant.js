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

        // Personalized Greetings
        if (command.includes('hello') || command.includes('hi')) {
            response = "Hello! How can I assist you today?"; // Personalized greeting
        }

        // Set a Timer or Alarm
        else if (command.includes('set a timer')) {
            const timeMatch = command.match(/set a timer for (\d+) (minutes?|hours?)/);
            if (timeMatch) {
                const time = parseInt(timeMatch[1]);
                const unit = timeMatch[2];
                // Logic to set a timer (you may need to implement a timer function)
                response = `Timer set for ${time} ${unit}.`; // Prepare response
            } else {
                response = "Please specify the duration for the timer."; // Handle error
            }
        }

        // Search the Web
        else if (command.includes('search for')) {
            const queryMatch = command.match(/search for (.+)/);
            const query = queryMatch ? queryMatch[1].trim() : '';
            if (query) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank'); // Open search in new tab
                response = `Searching for ${query}.`; // Prepare response
            } else {
                response = "Please specify what you want to search for."; // Handle error
            }
        }

        // Get Jokes or Quotes
        else if (command.includes('tell me a joke')) {
            try {
                const jokeResponse = await fetch('https://official-joke-api.appspot.com/random_joke'); // Fetch a random joke
                const jokeData = await jokeResponse.json(); // Parse JSON response
                response = `${jokeData.setup} ${jokeData.punchline}`; // Prepare response with setup and punchline
            } catch (error) {
                response = "Sorry, I couldn't fetch a joke at the moment."; // Handle fetch error
            }
        } else if (command.includes('give me a quote')) {
            // Fetch a random quote from an API (you may need to implement this)
            response = "The only way to do great work is to love what you do. - Steve Jobs"; // Example quote
        }

        // Translate Text
        else if (command.includes('translate')) {
            const translationMatch = command.match(/translate (.+) to (.+)/);
            if (translationMatch) {
                const textToTranslate = translationMatch[1].trim();
                const targetLanguage = translationMatch[2].trim();
                // Logic to translate text (you may need to implement a translation API)
                response = `Translating "${textToTranslate}" to ${targetLanguage}.`; // Prepare response
            } else {
                response = "Please specify the text and the language to translate to."; // Handle error
            }
        }

        // Get Definitions
        else if (command.includes('define')) {
            const wordMatch = command.match(/define (.+)/);
            const word = wordMatch ? wordMatch[1].trim() : '';
            if (word) {
                // Logic to get the definition (you may need to implement a dictionary API)
                response = `Defining the word "${word}".`; // Prepare response
            } else {
                response = "Please specify a word to define."; // Handle error
            }
        }

        // Unit Conversion
        else if (command.includes('convert')) {
            const conversionMatch = command.match(/convert (\d+) (.+) to (.+)/);
            if (conversionMatch) {
                const amount = conversionMatch[1];
                const fromUnit = conversionMatch[2].trim();
                const toUnit = conversionMatch[3].trim();
                // Logic to perform unit conversion (you may need to implement this)
                response = `Converting ${amount} ${fromUnit} to ${toUnit}.`; // Prepare response
            } else {
                response = "Please specify the amount and units to convert."; // Handle error
            }
        }

        // Fetch News
        else if (command.includes('news')) {
            try {
                const newsResponse = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=88d98dcdab1945b185182fc363f775cb'); // Fetch top news headlines
                const newsData = await newsResponse.json(); // Parse JSON response
                if (newsData.articles && newsData.articles.length > 0) {
                    const headlines = newsData.articles.map(article => article.title).join(', '); // Prepare headlines
                    response = `Here are the top news headlines: ${headlines}`; // Prepare response
                } else {
                    response = "Sorry, I couldn't find any news at the moment."; // Handle no articles found
                }
            } catch (error) {
                response = "Sorry, I couldn't fetch the news at the moment."; // Handle fetch error
            }
        }

        // Fetch Weather
        else if (command.includes('weather')) {
            const locationMatch = command.match(/weather in (.+)/);
            if (locationMatch) {
                const location = locationMatch[1].trim();
                try {
                    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=31e124c9141d013b0b8dc13c0e81abfe&units=metric`); // Fetch weather data
                    const weatherData = await weatherResponse.json(); // Parse JSON response
                    if (weatherData.main) {
                        const temperature = weatherData.main.temp; // Get temperature
                        const description = weatherData.weather[0].description; // Get weather description
                        response = `The current temperature in ${location} is ${temperature}°C with ${description}.`; // Prepare response
                    } else {
                        response = "Sorry, I couldn't find the weather for that location."; // Handle no weather data found
                    }
                } catch (error) {
                    response = "Sorry, I couldn't fetch the weather at the moment."; // Handle fetch error
                }
            } else {
                response = "Please specify a location to get the weather."; // Handle error for missing location
            }
        }

        // ... existing command checks ...
        // ... existing default response ...
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
