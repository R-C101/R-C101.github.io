function toggleMenu() {
  const menuContainer = document.querySelector(".menu-links-container");
  const icon = document.querySelector(".hamburger-icon");
  
  menuContainer.classList.toggle("open");
  icon.classList.toggle("open");
}

function toggleMode(isChecked) {
  const body = document.body;
  
  if (isChecked) {
    body.classList.add('fun-mode');
    localStorage.setItem('mode', 'fun');
  } else {
    body.classList.remove('fun-mode');
    localStorage.setItem('mode', 'professional');
  }
  
  // Reset menu state when mode changes
  const menuContainer = document.querySelector(".menu-links-container");
  if (menuContainer) {
    menuContainer.classList.remove("open");
  }
  const icon = document.querySelector(".hamburger-icon");
  if (icon) {
    icon.classList.remove("open");
  }
}

// Simple chat responses
function getChatResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return "Hey there! Nice to meet you! What would you like to know about AI or my portfolio?";
  } 
  else if (lowerMsg.includes('name')) {
    return "I'm Rishit's virtual assistant. The real Rishit is busy coding cool AI stuff!";
  }
  else if (lowerMsg.includes('ai') || lowerMsg.includes('ml') || lowerMsg.includes('machine learning')) {
    return "I love talking about AI and ML! I've worked with various frameworks like PyTorch and TensorFlow, and I'm particularly interested in LLMs and generative AI.";
  }
  else if (lowerMsg.includes('recipe') || lowerMsg.includes('food') || lowerMsg.includes('cook')) {
    return "Cooking is my stress reliever! Check out my recipes section for some of my favorites. The Midnight Pasta is perfect after a long coding session!";
  }
  else if (lowerMsg.includes('project') || lowerMsg.includes('work')) {
    return "I've worked on several exciting projects! My portfolio showcases OKULARY, CVAR, and RECAP. Would you like to know more about any of them?";
  }
  else {
    return "That's an interesting question! When this chat feature is fully implemented, I'll have a more detailed answer for you.";
  }
}

// Set up event listeners for the toggle switches and chat functionality
document.addEventListener('DOMContentLoaded', function() {
  const desktopToggle = document.getElementById('modeToggle');
  const mobileToggle = document.getElementById('modeToggleMobile');
  
  // Check for saved mode preference
  const savedMode = localStorage.getItem('mode');
  if (savedMode === 'fun') {
    desktopToggle.checked = true;
    mobileToggle.checked = true;
    document.body.classList.add('fun-mode');
  }
  
  // Add event listeners for mode toggle
  desktopToggle.addEventListener('change', function() {
    mobileToggle.checked = this.checked;
    toggleMode(this.checked);
  });
  
  mobileToggle.addEventListener('change', function() {
    desktopToggle.checked = this.checked;
    toggleMode(this.checked);
  });
  
  // Chat functionality
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');
  
  if (chatInput && sendButton && chatMessages) {
    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (message) {
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user';
        userMessageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(userMessageDiv);
        
        // Clear input
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate typing delay
        setTimeout(() => {
          // Add bot response
          const botMessageDiv = document.createElement('div');
          botMessageDiv.className = 'message bot';
          botMessageDiv.innerHTML = `<p>${getChatResponse(message)}</p>`;
          chatMessages.appendChild(botMessageDiv);
          
          // Scroll to bottom again
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
      }
    };
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
});
