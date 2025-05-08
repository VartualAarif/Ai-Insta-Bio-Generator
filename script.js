const OPENROUTER_API_KEY = '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';
const SITE_URL = window.location.origin;
const SITE_NAME = 'Instagram Bio Generator';

// DOM Elements
const styleSelect = document.getElementById('style');
const keywordsInput = document.getElementById('keywords');
const generateBioBtn = document.getElementById('generateBio');
const generateUsernameBtn = document.getElementById('generateUsername');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const copyButton = document.getElementById('copyButton');
const loadingDiv = document.getElementById('loading');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const contactForm = document.getElementById('contactForm');

// Chatbot Elements
const chatButton = document.getElementById('chat-button');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Chatbot State
let isChatOpen = false;

// Mobile Menu Toggle
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('active');
    });
}

// Contact Form Handler
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Here you would typically send the form data to your backend
        // For now, we'll just show a success message
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Bio/Username Generation
if (generateBioBtn && generateUsernameBtn) {
    generateBioBtn.addEventListener('click', () => generateContent('bio'));
    generateUsernameBtn.addEventListener('click', () => generateContent('username'));
}

if (copyButton) {
    copyButton.addEventListener('click', copyToClipboard);
}

// Toggle Chat Window
if (chatButton && chatWindow && closeChat) {
    chatButton.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatInput.focus();
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        isChatOpen = false;
    });
}

// Handle Chat Messages
if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = addTypingIndicator();

        try {
            // Get AI response
            const response = await getAIResponse(message);
            
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add AI response to chat
            addMessage(response, 'ai');
        } catch (error) {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Show error message
            addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            console.error('Chat error:', error);
        }
    });
}

async function generateContent(type) {
    const style = styleSelect.value;
    const keywords = keywordsInput.value.trim();
    
    showLoading();
    hideResult();

    const prompt = type === 'bio' 
        ? `Generate a creative Instagram bio in ${style} style${keywords ? ` including these keywords: ${keywords}` : ''}. Make it unique and engaging.`
        : `Generate a creative Instagram username in ${style} style${keywords ? ` related to: ${keywords}` : ''}. Make it unique and memorable.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            showResult(data.choices[0].message.content.trim());
        } else {
            throw new Error('No response from API');
        }
    } catch (error) {
        showResult('Sorry, something went wrong. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    if (loadingDiv) {
        loadingDiv.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingDiv) {
        loadingDiv.classList.add('hidden');
    }
}

function showResult(text) {
    if (resultText && resultDiv) {
        resultText.textContent = text;
        resultDiv.classList.remove('hidden');
    }
}

function hideResult() {
    if (resultDiv) {
        resultDiv.classList.add('hidden');
    }
}

async function copyToClipboard() {
    if (!resultText) return;
    
    try {
        await navigator.clipboard.writeText(resultText.textContent);
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add page transition effects
document.addEventListener('DOMContentLoaded', () => {
    const pageContent = document.querySelector('.container');
    if (pageContent) {
        pageContent.classList.add('page-transition');
        setTimeout(() => {
            pageContent.classList.add('active');
        }, 100);
    }
});

// Add message to chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-2';
    
    const messageContent = document.createElement('div');
    messageContent.className = sender === 'user' 
        ? 'bg-purple-600 text-white rounded-lg p-3 max-w-[80%] ml-auto'
        : 'bg-purple-100 rounded-lg p-3 max-w-[80%]';
    
    const messageText = document.createElement('p');
    messageText.className = sender === 'user' ? 'text-white' : 'text-gray-800';
    messageText.textContent = message;
    
    messageContent.appendChild(messageText);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'flex items-start space-x-2';
    
    const indicatorContent = document.createElement('div');
    indicatorContent.className = 'bg-purple-100 rounded-lg p-3';
    
    const dots = document.createElement('div');
    dots.className = 'flex space-x-1';
    dots.innerHTML = `
        <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
    `;
    
    indicatorContent.appendChild(dots);
    indicatorDiv.appendChild(indicatorContent);
    chatMessages.appendChild(indicatorDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return indicatorDiv;
}

// Get AI response
async function getAIResponse(message) {
    const prompt = `You are a helpful AI assistant for an Instagram Bio Generator website. 
    The user's message is: "${message}". 
    Please provide a helpful and friendly response. 
    If they ask about generating bios or usernames, guide them to use the main interface. 
    If they have questions about the service, provide clear and concise answers.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant for an Instagram Bio Generator website. Provide friendly and concise responses.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('No response from API');
        }
    } catch (error) {
        console.error('AI Response Error:', error);
        throw error;
    }
} 
