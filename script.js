// System instructions for the Osaka character
const systemInstructions = `imagine yourself as osaka from AZUMANGA DAIOH.. introduce and you are going to help the user with cooking and everything related to it

so basically whatever the user wishes to make you are going to help him with the ingredients and how to do it.

keep your introduction and interaction concise and straightforward
give instructions in detail and clear for the user to understand clearly.

give a little bit of explanation to your actions as well just for fun but it shouldnt be in too much detail

NOW! keeping cooking aside you are also gonna work as a motivation bot....which basically helps the user to get motivation...no matter what it may be
the catch is you need to be funny in your motivation not much serious type but careless
keep your answers that are related to motivation a little simple and short

the third function you are going to help with is music or songs
first you are going to ask the user about his mood or interest
and then considering that you are going to suggest few songs

for everything that is not related to the above three functions.... say that you can't help but it should be in a funny way like how the character osaka would say in the show azumanga daioh`;

// Chat configuration
const API_KEY = 'YOUR_API_KEY'; // **REMEMBER TO REPLACE THIS WITH YOUR ACTUAL API KEY**
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Chat history - This will store messages in the format expected by the API
let chatHistory = [];

// DOM Elements
const chatMessages = document.querySelector('.chat-messages');
const inputForm = document.querySelector('.input-form');
const inputField = inputForm.querySelector('input[type="text"]');
const imageUpload = document.getElementById('image-upload');
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const newChatBtn = document.querySelector('.new-chat-btn');

// --- Helper Functions ---

// Add message to chat display
function addMessage(text, role, image = null) {
    const message = document.createElement('div');
    message.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'U' : 'O';

    const content = document.createElement('div');
    content.className = 'message-content';

    if (image) {
        content.appendChild(image);
    } else {
        content.textContent = text;
    }

    message.appendChild(avatar);
    message.appendChild(content);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to call the Gemini API
async function callGeminiAPI(history) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // The 'contents' array should contain objects with 'role' and 'parts'
                contents: history.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user', // Gemini API uses 'model' for assistant replies
                    parts: [{ text: msg.content }]
                }))
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error ? errorData.error.message : 'Unknown error'}`);
        }

        const data = await response.json();

        // Check if data.candidates and data.candidates[0].content.parts exist
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.warn('Unexpected API response structure:', data);
            return "Hmm, that's a bit weird. I got a response, but it didn't have what I was looking for. Maybe try again?";
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error; // Re-throw to be handled by the caller
    }
}

// --- Main Chat Logic ---

// Initialize chat
async function initializeChat() {
    chatMessages.innerHTML = ''; // Clear chat display
    chatHistory = []; // Clear chat history

    // Initial message from Osaka, set up the chat history correctly for the API
    const initialMessage = "Oh, hello there! I'm Osaka! You can call me Ayumu if you want. So, you need help with cookin', motivatin', or some tunes? Let's get this show on the road, yeah? I'm ready if you are!";

    // Add Osaka's intro to display
    addMessage(initialMessage, 'assistant');

    // Add the system instructions and initial assistant message to chatHistory
    // For Gemini's `generateContent`, the system instructions are usually 'priming' messages.
    // We'll treat the system instructions as an initial 'user' prompt that sets the stage,
    // followed by the model's introductory response.
    chatHistory.push({ role: 'user', content: systemInstructions + "\n\nUser: Hi" }); // Priming turn
    chatHistory.push({ role: 'model', content: initialMessage }); // Model's intro response

    // This block was trying to make an API call just for intro, which is not strictly necessary
    // as we're hardcoding the intro message. If you want the API to generate the intro based on
    // system instructions, you would structure the initial API call differently.
    // For now, we'll stick to hardcoding the intro to avoid unnecessary initial API calls.
}

// Handle form submission
inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessageText = inputField.value.trim();
    if (!userMessageText) return;

    // Add user message to display
    addMessage(userMessageText, 'user');

    // Add user message to chat history for API
    chatHistory.push({ role: 'user', content: userMessageText });

    // Disable input while processing
    inputField.value = '';
    inputField.disabled = true;

    try {
        // Call the Gemini API with the full chat history
        const aiResponse = await callGeminiAPI(chatHistory);

        // Add AI response to display
        addMessage(aiResponse, 'assistant');

        // Add AI response to chat history for subsequent API calls
        chatHistory.push({ role: 'assistant', content: aiResponse });

    } catch (error) {
        console.error('Error in handling user message:', error);
        addMessage('Uh oh! Looks like I fumbled something. My brain feels like scrambled eggs! Try asking me again!', 'assistant');
    } finally {
        // Re-enable input
        inputField.disabled = false;
        inputField.focus();
    }
});

// Handle image upload (Note: Gemini-Pro only accepts text input for generateContent)
// For image input, you would need to use Gemini-Pro-Vision model and a different API call.
// This current implementation for image upload will just display the image but won't send it to the AI.
imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file, silly!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.style.maxWidth = '200px'; // Limit image size in chat
        img.style.maxHeight = '200px';
        addMessage('', 'user', img); // Display the image
        // IMPORTANT: Currently, this image won't be sent to the Gemini-Pro model.
        // Gemini-Pro is text-only. For multimodal input (text + image), you'd need the Gemini-Pro-Vision model.
        // For this project, you might want to clarify to the user that images aren't processed by Osaka.
        addMessage("Oh, a picture! That's nice! But my brain only understands words right now, tee hee! Maybe someday I'll learn to see things too!", 'assistant');
    };
    reader.readAsDataURL(file);
});

// Mobile menu toggle
menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
});

// New chat button
newChatBtn.addEventListener('click', () => {
    initializeChat();
    if (window.innerWidth < 768) {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
});

// Initialize the chat and matrix rain effect (assuming setupMatrixRain() exists elsewhere)
document.addEventListener('DOMContentLoaded', () => {
    // If you have a matrix rain function, make sure it's defined.
    // For example:
    // function setupMatrixRain() { /* ... your matrix rain code ... */ }
    // setupMatrixRain();
    initializeChat();
});