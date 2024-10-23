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
            this.synthesis.cancel(); // Stop any ongoing speech
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

        // Define conversion factors
    const conversionFactors = {
        length: {
            'inch': 1,
            'foot': 12,
            'yard': 36,
            'mile': 63360,
            'centimetre': 2.54,
            'meter': 39.37,
            'cm': 2.54,
            'm': 39.37,
            'kilometer': 39370,
            'km': 39370
        },
        weight: {
            'gram': 1,
            'kilogram': 1000,
            'g': 1,
            'kg': 1000,
            'ounce': 28.35,
            'pound': 453.592
        },
        temperature: {
            'celsius': (c) => c,
            'fahrenheit': (f) => (f - 32) * 5 / 9,
            'kelvin': (k) => k - 273.15
        }
    };

        // Personalized Greetings
        if (command.includes('hello') || command.includes('hi')) {
            const responses = ["Hello!", "Hi there!", "Greetings!"];
            response = responses[Math.floor(Math.random() * responses.length)];
        }

        // Personalized Greetings with Name
        else if (command.includes('my name is') || command.includes('i am')) {
            const nameMatch = command.match(/(?:my name is|i am) (.+)/);
            const name = nameMatch ? nameMatch[1].trim() : '';
            if (name) {
                response = `Hi ${name}!`; // Prepare personalized greeting
            } else {
                response = "Please tell me your name."; // Handle error
            }
        }

        // Set a Timer or Alarm
        else if (command.includes('set a timer')) {
            const timeMatch = command.match(/set a timer for (\d+) (minutes?|hours?|seconds?)/);
            if (timeMatch) {
                const time = parseInt(timeMatch[1]);
                const unit = timeMatch[2];
                // Logic to set a timer (you may need to implement a timer function)
                response = `Timer set for ${time} ${unit}.`; // Prepare response
            } else {
                response = "Please specify the duration for the timer."; // Handle error
            }
        }

        // Open a URL
        else if (command.includes('open')) {
            const queryMatch = command.match(/(?:open) (.+)/);
            const query = queryMatch ? queryMatch[1].trim() : '';
            if (query) {
                window.open(`https:${encodeURIComponent(query)}.com`, '_blank'); // Open search in new tab
                response = `Opening ${query}.`; // Prepare response
            } else {
                response = "Please specify the website to open."; // Handle error
            }
        }

        // Pronounce
        else if (command.includes('pronounce')) {
            const queryMatch = command.match(/(?:pronounce) (.+)/);
            const query = queryMatch ? queryMatch[1].trim() : '';
            if (query) {                
                response = `${query}.`; // Prepare response
            } else {
                response = "Please specify the word to pronounce."; // Handle error
            }
        }

        // Search the Web
        else if (command.includes('search for') || command.includes('search about')) {
            const queryMatch = command.match(/(?:search for|search about) (.+)/);
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

        // Calculate
        else if (command.includes('calculate')) {
            try {
                // Extract the mathematical expression from the command
                const expression = command.replace('calculate', '').trim();
                
                // Replace 'x' with '*' for multiplication
                const safeExpression = expression.replace(/x/g, '*');

                // Evaluate the mathematical expression using Math.js
                const result = math.evaluate(safeExpression); // Use Math.js to evaluate
                
                response = `The result is: ${result}`;
                
            } catch (error) {
                response = "Sorry, I couldn't calculate that. Please try a valid mathematical expression.";
                console.error('Error in calculation:', error);
            }
        }

        // Translate Text
        else if (command.includes('translate')) {
            const queryMatch = command.match(/(?:translate) (.+)/);
            const query = queryMatch ? queryMatch[1].trim() : '';
            if (query) {
                window.open(`https://www.google.com/search?q=translate ${encodeURIComponent(query)}`, '_blank'); // Open search in new tab
                response = `Searching for ${query}.`; // Prepare response
            } else {
                response = "Please specify the word you want to translate"; // Handle error
            }
        }
        
        
        


        // Get Definitions
        else if (command.includes('define')) {
            const wordMatch = command.match(/define (.+)/);
            const word = wordMatch ? wordMatch[1].trim() : '';
            if (word) {
                try {
                    const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`); // Fetch definition from the API
                    const definitionData = await definitionResponse.json(); // Parse JSON response
                    if (definitionData.length > 0) {
                        const definition = definitionData[0].meanings[0].definitions[0].definition; // Get the first definition
                        response = `Definition of "${word}": ${definition}`; // Prepare response with definition
                    } else {
                        response = "No definition found."; // Handle no definition found
                    }
                } catch (error) {
                    response = "Sorry, I couldn't fetch the definition at the moment."; // Handle fetch error
                }
            } else {
                response = "Please specify a word to define."; // Handle error
            }
        }

    
        // Unit Conversion
        else if (command.includes('convert')) {
            const conversionMatch = command.match(/convert (\d+) (.+) to (.+)/);
            if (conversionMatch) {
                const amount = parseFloat(conversionMatch[1]);
                const fromUnit = conversionMatch[2].trim().toLowerCase();
                const toUnit = conversionMatch[3].trim().toLowerCase();

                let result;

                // Check if units are for length
                if (Object.keys(conversionFactors.length).includes(fromUnit) && Object.keys(conversionFactors.length).includes(toUnit)) {
                    const baseUnit = conversionFactors.length[fromUnit];
                    const targetUnit = conversionFactors.length[toUnit];
                    result = amount * baseUnit / targetUnit;
                    response = `Converting ${amount} ${fromUnit} to ${toUnit}: ${result} ${toUnit}`;
                }
                // Check if units are for weight
                else if (Object.keys(conversionFactors.weight).includes(fromUnit) && Object.keys(conversionFactors.weight).includes(toUnit)) {
                    const baseUnit = conversionFactors.weight[fromUnit];
                    const targetUnit = conversionFactors.weight[toUnit];
                    result = amount * baseUnit / targetUnit;
                    response = `Converting ${amount} ${fromUnit} to ${toUnit}: ${result} ${toUnit}`;
                }
                // Check if units are for temperature
                else if (['celsius', 'fahrenheit', 'kelvin'].includes(fromUnit) && ['celsius', 'fahrenheit', 'kelvin'].includes(toUnit)) {
                    let baseValue;
                    switch (fromUnit) {
                        case 'fahrenheit':
                            baseValue = conversionFactors.temperature.fahrenheit(amount);
                            break;
                        case 'kelvin':
                            baseValue = conversionFactors.temperature.kelvin(amount);
                            break;
                        default:
                            baseValue = amount; // Celsius
                    }

                    switch (toUnit) {
                        case 'fahrenheit':
                            result = baseValue * 9 / 5 + 32;
                            break;
                        case 'kelvin':
                            result = baseValue + 273.15;
                            break;
                        default:
                            result = baseValue; // Celsius
                    }

                    response = `Converting ${amount} ${fromUnit} to ${toUnit}: ${result} ${toUnit}`;
                } else {
                    response = "Unsupported unit conversion.";
                }
            } else {
                response = "Please specify the amount and units to convert.";
            }
        }

        // Get News
        else if (command.includes('news about') || command.includes('news on')) {
            const queryMatch = command.match(/(?:news about|news on) (.+)/);
            const query = queryMatch ? queryMatch[1].trim() : '';
            if (query) {
                try {
                    const newsResponse = await fetch(`https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(query)}&sortBy=popularity&apiKey=88d98dcdab1945b185182fc363f775cb`); // Fetch news
                    const newsData = await newsResponse.json(); // Parse JSON response
                    console.log(newsData); // Log the entire news data response
                    if (newsData.status === "ok" && newsData.totalResults > 0) {
                        const headlines = newsData.articles.slice(0, 5).map(article => article.title).join(', '); // Extract headlines
                        response = `Here are the headlines:\n ${headlines}`; // Prepare response
                    } else {
                        response = "No news articles found."; // Handle no articles found
                    }
                } catch (error) {
                    response = "Sorry, I couldn't fetch the news at the moment."; // Handle fetch error
                }
            } else {
                response = "Please specify what you want the news on."; // Handle error
            }
        }

        // Stop Reading
        else if (command.includes('stop')) {
            this.synthesis.cancel(); // Stop speech synthesis
            response = "Stopped reading."; // Prepare response
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
        }else{
            response = "I'm not sure how to help with that. Try commands like 'time', 'date', 'news', 'weather', 'define' or 'hello'";
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
