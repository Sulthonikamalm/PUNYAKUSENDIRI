/**
 * =====================================================
 * CHATBOT - Main Controller
 * Handles UI logic, mode switching, and message display
 * =====================================================
 */

(function() {
    'use strict';

    // =====================================================
    // State Management
    // =====================================================
    const ChatBotState = {
        isOpen: false,
        currentMode: null, // 'guided', 'freetext', 'curhat'
        isRecording: false,
        recognition: null,
        sessionId: null,
        conversationHistory: [],
    };

    // =====================================================
    // DOM Elements
    // =====================================================
    const DOM = {
        // Modal
        modalOverlay: null,
        modal: null,

        // Screens
        modeSelectionScreen: null,
        chatInterfaceScreen: null,

        // Mode selection
        modeCards: null,

        // Chat interface
        chatModeTitle: null,
        chatModeDesc: null,
        chatMessagesContainer: null,
        chatMessages: null,
        typingIndicator: null,
        chatInput: null,
        btnSendChat: null,
        btnVoiceInput: null,
        btnStopRecording: null,
        voiceRecordingMode: null,
        chatInputWrapper: null,

        // Buttons
        btnCloseChatbot: null,
        btnCloseChatbot2: null,
        btnBackToModes: null,
        btnMinimizeChat: null,
    };

    // =====================================================
    // Initialization
    // =====================================================
    function init() {
        // Get DOM elements
        cacheDOMElements();

        // Attach event listeners
        attachEventListeners();

        // Initialize Web Speech API
        initSpeechRecognition();

        // Generate session ID
        ChatBotState.sessionId = generateSessionId();

        console.log('[ChatBot] Initialized successfully');
    }

    function cacheDOMElements() {
        DOM.modalOverlay = document.getElementById('chatbotModalOverlay');
        DOM.modeSelectionScreen = document.getElementById('modeSelectionScreen');
        DOM.chatInterfaceScreen = document.getElementById('chatInterfaceScreen');
        DOM.modeCards = document.querySelectorAll('.mode-card');
        DOM.chatModeTitle = document.getElementById('chatModeTitle');
        DOM.chatModeDesc = document.getElementById('chatModeDesc');
        DOM.chatMessagesContainer = document.getElementById('chatMessagesContainer');
        DOM.chatMessages = document.getElementById('chatMessages');
        DOM.typingIndicator = document.getElementById('typingIndicator');
        DOM.chatInput = document.getElementById('chatInput');
        DOM.btnSendChat = document.getElementById('btnSendChat');
        DOM.btnVoiceInput = document.getElementById('btnVoiceInput');
        DOM.btnStopRecording = document.getElementById('btnStopRecording');
        DOM.voiceRecordingMode = document.getElementById('voiceRecordingMode');
        DOM.chatInputWrapper = document.getElementById('chatInputWrapper');
        DOM.btnCloseChatbot = document.getElementById('btnCloseChatbot');
        DOM.btnCloseChatbot2 = document.getElementById('btnCloseChatbot2');
        DOM.btnBackToModes = document.getElementById('btnBackToModes');
        DOM.btnMinimizeChat = document.getElementById('btnMinimizeChat');
    }

    function attachEventListeners() {
        // Close buttons
        DOM.btnCloseChatbot?.addEventListener('click', closeChatBot);
        DOM.btnCloseChatbot2?.addEventListener('click', closeChatBot);
        DOM.btnMinimizeChat?.addEventListener('click', closeChatBot);

        // Back to modes
        DOM.btnBackToModes?.addEventListener('click', backToModeSelection);

        // Mode selection
        DOM.modeCards?.forEach(card => {
            const btn = card.querySelector('.btn-select-mode');
            btn?.addEventListener('click', () => {
                const mode = card.dataset.mode;
                selectMode(mode);
            });
        });

        // Chat input
        DOM.chatInput?.addEventListener('input', handleInputChange);
        DOM.chatInput?.addEventListener('keypress', handleKeyPress);
        DOM.btnSendChat?.addEventListener('click', sendMessage);

        // Voice input
        DOM.btnVoiceInput?.addEventListener('click', startVoiceRecording);
        DOM.btnStopRecording?.addEventListener('click', stopVoiceRecording);

        // Close on overlay click
        DOM.modalOverlay?.addEventListener('click', (e) => {
            if (e.target === DOM.modalOverlay) {
                closeChatBot();
            }
        });
    }

    // =====================================================
    // Modal Control
    // =====================================================
    function openChatBot() {
        ChatBotState.isOpen = true;
        DOM.modalOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Show mode selection by default
        showModeSelection();
    }

    function closeChatBot() {
        ChatBotState.isOpen = false;
        DOM.modalOverlay?.classList.remove('active');
        document.body.style.overflow = '';

        // Stop recording if active
        if (ChatBotState.isRecording) {
            stopVoiceRecording();
        }
    }

    function showModeSelection() {
        DOM.modeSelectionScreen.style.display = 'block';
        DOM.chatInterfaceScreen.style.display = 'none';
    }

    function showChatInterface() {
        DOM.modeSelectionScreen.style.display = 'none';
        DOM.chatInterfaceScreen.style.display = 'flex';
    }

    function backToModeSelection() {
        // Confirm if there's conversation history
        if (ChatBotState.conversationHistory.length > 0) {
            if (!confirm('Kembali ke pemilihan mode akan menghapus percakapan. Lanjutkan?')) {
                return;
            }
        }

        // Reset state
        ChatBotState.currentMode = null;
        ChatBotState.conversationHistory = [];
        DOM.chatMessages.innerHTML = '';

        showModeSelection();
    }

    // =====================================================
    // Mode Selection
    // =====================================================
    function selectMode(mode) {
        ChatBotState.currentMode = mode;

        // Update UI based on mode
        const modeConfig = {
            guided: {
                title: 'Chat Guided',
                desc: 'Mode Panduan Terstruktur',
                welcomeMessage: 'Halo! Saya akan membantu Anda membuat laporan dengan pertanyaan terstruktur. Mari kita mulai!',
            },
            freetext: {
                title: 'Chat Free Text',
                desc: 'Mode Cerita Bebas',
                welcomeMessage: 'Halo! Ceritakan kejadian yang ingin Anda laporkan dengan bebas. Saya akan memahami dan mengekstrak informasi yang diperlukan.',
            },
            curhat: {
                title: 'Chat Curhat',
                desc: 'Mode Konseling & Dukungan',
                welcomeMessage: 'Halo! Ini adalah ruang aman untuk Anda bercerita. Saya di sini untuk mendengarkan dan memberikan dukungan. Ceritakan apa yang Anda rasakan.',
            },
        };

        const config = modeConfig[mode];
        DOM.chatModeTitle.textContent = config.title;
        DOM.chatModeDesc.textContent = config.desc;

        // Clear previous messages
        DOM.chatMessages.innerHTML = '';
        ChatBotState.conversationHistory = [];

        // Show chat interface
        showChatInterface();

        // Send welcome message
        addBotMessage(config.welcomeMessage);

        // Initialize mode-specific logic
        setTimeout(() => {
            switch(mode) {
                case 'guided':
                    window.GuidedMode?.start();
                    break;
                case 'freetext':
                    window.FreeTextMode?.start();
                    break;
                case 'curhat':
                    window.CurhatMode?.start();
                    break;
            }
        }, 500);
    }

    // =====================================================
    // Message Handling
    // =====================================================
    function addBotMessage(text, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble bot';

        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = text;

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = getCurrentTime();

        bubble.appendChild(messageText);
        bubble.appendChild(time);

        // Add quick action buttons if provided
        if (options.quickActions && options.quickActions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quick-actions';

            options.quickActions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'quick-action-btn';
                btn.textContent = action.label;
                btn.addEventListener('click', () => {
                    if (action.callback) {
                        action.callback();
                    }
                });
                actionsDiv.appendChild(btn);
            });

            bubble.appendChild(actionsDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        DOM.chatMessages.appendChild(messageDiv);

        // Store in history
        ChatBotState.conversationHistory.push({
            role: 'bot',
            text: text,
            timestamp: new Date().toISOString(),
        });

        scrollToBottom();
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble user';

        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = text;

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = getCurrentTime();

        bubble.appendChild(messageText);
        bubble.appendChild(time);

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar user';
        avatar.innerHTML = '<i class="fas fa-user"></i>';

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
        DOM.chatMessages.appendChild(messageDiv);

        // Store in history
        ChatBotState.conversationHistory.push({
            role: 'user',
            text: text,
            timestamp: new Date().toISOString(),
        });

        scrollToBottom();
    }

    function showTypingIndicator() {
        DOM.typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    function hideTypingIndicator() {
        DOM.typingIndicator.style.display = 'none';
    }

    function scrollToBottom() {
        setTimeout(() => {
            DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
        }, 100);
    }

    // =====================================================
    // Input Handling
    // =====================================================
    function handleInputChange() {
        const value = DOM.chatInput.value.trim();
        DOM.btnSendChat.disabled = value.length === 0;
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function sendMessage() {
        const text = DOM.chatInput.value.trim();
        if (!text) return;

        // Add user message
        addUserMessage(text);

        // Clear input
        DOM.chatInput.value = '';
        DOM.btnSendChat.disabled = true;

        // Process message based on current mode
        processUserMessage(text);
    }

    function processUserMessage(text) {
        // Show typing indicator
        showTypingIndicator();

        // Delegate to mode-specific handler
        setTimeout(() => {
            switch(ChatBotState.currentMode) {
                case 'guided':
                    window.GuidedMode?.handleUserMessage(text);
                    break;
                case 'freetext':
                    window.FreeTextMode?.handleUserMessage(text);
                    break;
                case 'curhat':
                    window.CurhatMode?.handleUserMessage(text);
                    break;
            }
        }, 800); // Simulate processing delay
    }

    // =====================================================
    // Voice Input (Speech-to-Text)
    // =====================================================
    function initSpeechRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('[ChatBot] Speech Recognition not supported');
            if (DOM.btnVoiceInput) {
                DOM.btnVoiceInput.style.display = 'none';
            }
            return;
        }

        ChatBotState.recognition = new SpeechRecognition();
        ChatBotState.recognition.lang = 'id-ID';
        ChatBotState.recognition.continuous = true;
        ChatBotState.recognition.interimResults = true;

        ChatBotState.recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                const currentValue = DOM.chatInput.value;
                DOM.chatInput.value = (currentValue + ' ' + finalTranscript).trim();
                handleInputChange();
            }
        };

        ChatBotState.recognition.onerror = function(event) {
            console.error('[ChatBot] Speech recognition error:', event.error);
            stopVoiceRecording();

            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                addBotMessage('Maaf, terjadi kesalahan saat merekam suara. Silakan coba lagi.');
            }
        };

        ChatBotState.recognition.onend = function() {
            if (ChatBotState.isRecording) {
                // Restart if still in recording mode
                try {
                    ChatBotState.recognition.start();
                } catch (e) {
                    stopVoiceRecording();
                }
            }
        };
    }

    function startVoiceRecording() {
        if (!ChatBotState.recognition) {
            alert('Fitur voice input tidak didukung di browser Anda.');
            return;
        }

        try {
            ChatBotState.isRecording = true;
            ChatBotState.recognition.start();

            // Update UI
            DOM.btnVoiceInput.classList.add('recording');
            DOM.chatInputWrapper.style.display = 'none';
            DOM.voiceRecordingMode.style.display = 'flex';

        } catch (error) {
            console.error('[ChatBot] Failed to start recording:', error);
            ChatBotState.isRecording = false;
        }
    }

    function stopVoiceRecording() {
        if (!ChatBotState.recognition) return;

        try {
            ChatBotState.isRecording = false;
            ChatBotState.recognition.stop();

            // Update UI
            DOM.btnVoiceInput.classList.remove('recording');
            DOM.chatInputWrapper.style.display = 'flex';
            DOM.voiceRecordingMode.style.display = 'none';

        } catch (error) {
            console.error('[ChatBot] Failed to stop recording:', error);
        }
    }

    // =====================================================
    // Utility Functions
    // =====================================================
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // =====================================================
    // Public API (exposed to mode modules)
    // =====================================================
    window.ChatBot = {
        addBotMessage,
        addUserMessage,
        showTypingIndicator,
        hideTypingIndicator,
        getState: () => ChatBotState,
        closeChatBot,
    };

    // =====================================================
    // FABsigap Integration (TemanKu Chatbot)
    // =====================================================
    window.TemanKuChatbot = {
        open: openChatBot,
        close: closeChatBot,
        isOpen: () => ChatBotState.isOpen,
    };

    // =====================================================
    // Initialize on DOM ready
    // =====================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
