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
const API_KEY = 'AIzaSyAcmNB8BeUEYCaSmVW3AUZhW1ni21unAgs';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Chat history
let chatHistory = [];

// DOM Elements
const chatMessages = document.querySelector('.chat-messages');
const inputForm = document.querySelector('.input-form');
const inputField = inputForm.querySelector('input[type="text"]');
const imageUpload = document.getElementById('image-upload');
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const newChatBtn = document.querySelector('.new-chat-btn');


// Initialize chat
async function initializeChat() {
  chatMessages.innerHTML = '';
  chatHistory = [];
  
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemInstructions}\n\nUser: Hi\nAssistant: Oh, hello there! I'm Osaka! You can call me Ayumu if you want. So, you need help with cookin', motivatin', or some tunes? Let's get this show on the road, yeah? I'm ready if you are!`
          }]
        }]
      })
    });

    const data = await response.json();
    const initialMessage = "Oh, hello there! I'm Osaka! You can call me Ayumu if you want. So, you need help with cookin', motivatin', or some tunes? Let's get this show on the road, yeah? I'm ready if you are!";
    
    addMessage(initialMessage, 'assistant');
    chatHistory.push({ role: 'system', content: systemInstructions });
    chatHistory.push({ role: 'assistant', content: initialMessage });
  } catch (error) {
    console.error('Error initializing chat:', error);
    addMessage('Oops! Something went wrong. Please try again.', 'assistant');
  }
}

// Add message to chat
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

// Handle form submission
inputForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = inputField.value.trim();
  if (!message) return;
  
  addMessage(message, 'user');
  chatHistory.push({ role: 'user', content: message });
  inputField.value = '';
  inputField.disabled = true;
  
  try {
    // Construct the conversation history with system instructions
    const conversationText = chatHistory
      .map(msg => {
        if (msg.role === 'system') {
          return msg.content;
        }
        return `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
      })
      .join('\n');

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${conversationText}\nAssistant:`
          }]
        }]
      })
    });

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    addMessage(aiResponse, 'assistant');
    chatHistory.push({ role: 'assistant', content: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    addMessage('Oops! Something went wrong. Please try again.', 'assistant');
  }
  
  inputField.disabled = false;
  inputField.focus();
});

// Handle image upload
imageUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = document.createElement('img');
    img.src = event.target.result;
    addMessage('', 'user', img);
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

// Initialize the chat and matrix rain effect
document.addEventListener('DOMContentLoaded', () => {
  setupMatrixRain();
  initializeChat();
});