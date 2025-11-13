/**
 * =====================================================
 * CURHAT MODE - Emotional Support & Counseling
 * Provides safe space for venting and emotional support
 * Can offer to create report if appropriate
 * =====================================================
 */

(function() {
    'use strict';

    // =====================================================
    // Emergency Contacts Configuration
    // PENTING: Update nomor di bawah jika ada perubahan kontak darurat
    // =====================================================
    const EMERGENCY_CONTACTS = {
        // WhatsApp PPKS Telkom University - GANTI DI SINI jika nomor berubah
        whatsappPPKS: '+6282188467793', // Format: +62xxx (tanpa spasi/dash untuk URL)
        whatsappPPKSDisplay: '+62 821-8846-7793', // Format display untuk user

        // Hotline lainnya
        emergency: '112',
        hotlineKemenkes: '119 (ext 8)',
        psikologKampus: 'ext. 1234',
        emailKonseling: 'konseling@telkomuniversity.ac.id',
    };

    // =====================================================
    // Curhat Mode State
    // =====================================================
    const CurhatState = {
        conversationHistory: [],
        emotionalState: 'unknown', // 'distressed', 'angry', 'sad', 'confused', 'calm'
        hasSharedIncident: false,
        turnCount: 0,
        shouldOfferReport: false,
    };

    // =====================================================
    // Supportive Response Templates
    // =====================================================
    const SUPPORTIVE_RESPONSES = {
        listening: [
            'Saya mendengarkan Anda. Silakan lanjutkan bercerita...',
            'Terima kasih sudah mau berbagi dengan saya. Saya di sini untuk mendengarkan.',
            'Anda tidak sendirian. Silakan ceritakan apa yang Anda rasakan.',
            'Saya memahami ini tidak mudah. Ambil waktu Anda.',
        ],
        empathy: [
            'Saya turut prihatin atas apa yang Anda alami.',
            'Perasaan Anda sangat valid dan wajar dalam situasi ini.',
            'Tidak ada yang salah dengan apa yang Anda rasakan sekarang.',
            'Anda sangat berani sudah menceritakan hal ini.',
        ],
        validation: [
            'Apa yang terjadi pada Anda bukan salah Anda.',
            'Anda berhak merasa aman dan dihormati.',
            'Reaksi Anda sangat manusiawi dan dapat dipahami.',
            'Terima kasih sudah percaya untuk berbagi cerita ini.',
        ],
        encouragement: [
            'Anda sangat kuat karena sudah sampai di titik ini.',
            'Langkah untuk bercerita adalah langkah penting menuju pemulihan.',
            'Anda tidak harus menghadapi ini sendirian.',
            'Ada banyak orang yang peduli dan siap membantu Anda.',
        ],
    };

    const CRISIS_KEYWORDS = [
        // Frasa langsung
        "bunuh diri",
        "bunuh dir",
        "mau bunuh diri",
        "pengen bunuh diri",
        "aku mau bunuh diri",
        "aku pengen bunuh diri",
        "aku ingin bunuh diri",
        "aku mau mati",
        "aku pengen mati",
        "aku ingin mati",
        "pengen mati",
        "ingin mati",
        "mau mati",
        "mati aja",
        "mati saja",
        "lebih baik mati",
        "mending mati",
        "mendingan mati",
        "mau ngakhirin hidup",
        "ngakhirin hidup",
        "akhiri hidup",
        "mengakhiri hidup",
        "aku mau ngakhirin semuanya",
        "aku pengen ngilang selamanya",
        "aku mau pergi selamanya",

        // Variasi emosional
        "cape hidup",
        "capek hidup",
        "lelah hidup",
        "bosan hidup",
        "hidup gak ada arti",
        "hidup gak berarti",
        "hidup hampa",
        "hidup sia sia",
        "hidup ini percuma",
        "gak mau hidup lagi",
        "tidak mau hidup lagi",
        "gak pengen hidup",
        "tidak ingin hidup",
        "hidupku hancur",
        "hidupku gak ada gunanya",
        "aku gagal",
        "aku gak berguna",
        "aku cuma beban",
        "aku beban keluarga",
        "aku pengen ngilang",
        "aku mau hilang",
        "aku ingin menghilang",
        "pengen hilang aja",
        "mending aku gak ada",
        "andai aku gak lahir",
        "seandainya aku gak lahir",
        "aku nyerah",
        "aku menyerah",
        "udah gak kuat",
        "udah gak tahan",
        "gak sanggup lagi",
        "udah cukup",
        "cukup sampai sini",
        "aku capek banget",
        "aku udah lelah",

        // Aksi melukai diri
        "lukai diri",
        "sakiti diri",
        "nyakitin diri",
        "nyilet tangan",
        "iris tangan",
        "sayat tangan",
        "sayat pergelangan",
        "potong urat",
        "minum obat banyak",
        "minum racun",
        "makan racun",
        "terjun dari",
        "loncat dari",
        "loncat jembatan",
        "loncat gedung",
        "jatuhin diri",
        "tabrak aku",
        "tabrakin diri",
        "nyebur ke sungai",
        "tidur selamanya",

        // Bentuk campuran atau tidak langsung
        "hidupku udah berakhir",
        "aku udah selesai",
        "aku udah gak mau apa apa",
        "biarin aja aku mati",
        "biarin aku pergi",
        "aku gak pantas hidup",
        "aku pengen tenang selamanya",
        "aku mau tidur selamanya",
        "aku mau istirahat selamanya",
        "aku gak bisa lanjut",
        "aku udah gak tahan hidup kayak gini",
        "aku gak mau bangun lagi",
        "aku pengen diem selamanya",
        "semoga aku gak bangun lagi",
        "aku udah gak peduli",
        "aku pengen bebas dari semua ini",
        "semua udah gak ada artinya",
        "aku cuma pengen semuanya selesai",

        // Bahasa gaul atau disingkat
        "pgn mati",
        "pgn ngilang",
        "capek bgt hidup",
        "lelah bgt hidup",
        "udh gk kuat",
        "udh gk tahan",
        "hidup gk ada gunanya",
        "hidup sia2",
        "pgn bunuh diri",
        "mau bunuh dri",
        "mau bundir aja",
        "ngakhirin aja",
        "cukup smpe sini",
        "gak guna aku hidup",
        "aku useless",
        "aku worthless",
        "cape pengen bundir aja",

        // Bahasa Inggris (tetap penting untuk konteks bilingual)
        "suicide",
        "want to die",
        "i want to die",
        "kill myself",
        "end my life",
        "i can't live anymore",
        "life is meaningless",
        "i'm done",
        "i'm tired of living",
        "no reason to live",
        "i hate my life",
        "let me die",
        "wish i could die",
        "life sucks",
        "i'm hopeless",
        "self harm",
        "cut myself",
    ];

    // =====================================================
    // Curhat Mode Functions
    // =====================================================
    function start() {
        // Reset state
        CurhatState.conversationHistory = [];
        CurhatState.emotionalState = 'unknown';
        CurhatState.hasSharedIncident = false;
        CurhatState.turnCount = 0;
        CurhatState.shouldOfferReport = false;

        // Initial supportive message
        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Ini adalah ruang aman untuk Anda. Anda bisa bercerita tentang apa pun yang Anda rasakan. Saya di sini untuk mendengarkan tanpa menghakimi.');

            setTimeout(() => {
                window.ChatBot.addBotMessage('Apa yang sedang Anda rasakan hari ini?');
            }, 1500);
        }, 500);
    }

    async function handleUserMessage(text) {
        CurhatState.turnCount++;
        CurhatState.conversationHistory.push({
            role: 'user',
            text: text,
            timestamp: new Date().toISOString(),
        });

        // Check for crisis keywords
        if (containsCrisisKeywords(text)) {
            await handleCrisisResponse();
            return;
        }

        // Analyze emotional state
        CurhatState.emotionalState = detectEmotionalState(text);

        // Check if incident is mentioned
        if (detectIncidentMention(text)) {
            CurhatState.hasSharedIncident = true;
        }

        // Generate supportive response
        await generateSupportiveResponse(text);
    }

    function containsCrisisKeywords(text) {
        const lowerText = text.toLowerCase();
        return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
    }

    async function handleCrisisResponse() {
        window.ChatBot.hideTypingIndicator();

        window.ChatBot.addBotMessage('💙 Saya sangat prihatin mendengar Anda merasakan hal ini. Keselamatan Anda sangat penting bagi saya.');

        setTimeout(() => {
            window.ChatBot.addBotMessage('Saya detect kamu mungkin sedang dalam kondisi yang berat. Aku sangat khawatir dengan kamu.');

            setTimeout(() => {
                showEmergencyOptions();
            }, 1500);
        }, 1000);
    }

    function showEmergencyOptions() {
        const options = {
            quickActions: [
                {
                    label: '📞 Hubungi Profesional',
                    callback: () => redirectToWhatsApp(),
                },
                {
                    label: '🧘 Latihan Pernapasan',
                    callback: () => startBreathingExercise(),
                },
                {
                    label: '💬 Tetap Lanjut Chat',
                    callback: () => continueCurhat(),
                },
            ],
        };

        window.ChatBot.addBotMessage('Pilih yang kamu butuhkan:', options);
    }

    /**
     * Redirect user to WhatsApp PPKS
     * PENTING: Nomor WhatsApp dikonfigurasi di EMERGENCY_CONTACTS di atas
     */
    function redirectToWhatsApp() {
        window.ChatBot.addUserMessage('📞 Hubungi Profesional');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage(`Baik, saya akan menghubungkan kamu dengan tim PPKS profesional kami melalui WhatsApp.\n\n💙 **Nomor WhatsApp PPKS:**\n${EMERGENCY_CONTACTS.whatsappPPKSDisplay}\n\nKamu akan diarahkan ke WhatsApp dalam beberapa detik...`);

            // Redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                // WhatsApp URL format: https://wa.me/[phone_number]?text=[optional_message]
                const whatsappURL = `https://wa.me/${EMERGENCY_CONTACTS.whatsappPPKS}?text=${encodeURIComponent('Halo, saya butuh bantuan dari PPKS.')}`;

                // Open WhatsApp in new tab
                window.open(whatsappURL, '_blank');

                // Show follow-up message
                setTimeout(() => {
                    window.ChatBot.addBotMessage('WhatsApp sudah terbuka di tab baru. Jika belum terbuka, klik link ini: ' + EMERGENCY_CONTACTS.whatsappPPKSDisplay);

                    setTimeout(() => {
                        window.ChatBot.addBotMessage('Apakah kamu masih ingin melanjutkan percakapan denganku?', {
                            quickActions: [
                                { label: 'Ya, Lanjut Chat', callback: () => continueCurhat() },
                                { label: 'Selesai', callback: () => window.ChatBot.closeChatBot() },
                            ],
                        });
                    }, 1500);
                }, 1000);
            }, 2000);
        }, 800);
    }

    function startBreathingExercise() {
        window.ChatBot.addUserMessage('🧘 Latihan Pernapasan');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();

            // Check if BreathingExercise module is available
            if (window.BreathingExercise && window.BreathingExercise.start) {
                window.ChatBot.addBotMessage('Baik, aku akan membuka latihan pernapasan untuk membantu kamu lebih tenang. 🧘‍♀️');

                setTimeout(() => {
                    window.ChatBot.closeChatBot();
                    window.BreathingExercise.start();
                }, 1000);
            } else {
                window.ChatBot.addBotMessage('**🧘 Latihan Pernapasan Sederhana:**\n\n1️⃣ Tarik napas dalam-dalam (4 detik)\n2️⃣ Tahan (4 detik)\n3️⃣ Buang napas perlahan (6 detik)\n4️⃣ Ulangi 5-10 kali\n\nFokus pada napasmu dan rasakan tubuhmu lebih rileks. 💙');

                setTimeout(() => {
                    window.ChatBot.addBotMessage('Apakah kamu merasa sedikit lebih baik? Mau lanjut ngobrol?', {
                        quickActions: [
                            { label: 'Ya, Lanjut', callback: () => continueCurhat() },
                            { label: 'Selesai', callback: () => window.ChatBot.closeChatBot() },
                        ],
                    });
                }, 3000);
            }
        }, 1000);
    }

    function continueCurhat() {
        window.ChatBot.addUserMessage('Saya Baik-baik Saja');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Baik, saya di sini untuk mendengarkan. Ceritakan apa yang Anda ingin sampaikan.');
        }, 1000);
    }

    function detectEmotionalState(text) {
        const lowerText = text.toLowerCase();

        // Distressed
        if (lowerText.match(/(trauma|takut|panik|cemas|khawatir)/)) {
            return 'distressed';
        }

        // Angry
        if (lowerText.match(/(marah|kesal|benci|jengkel|dongkol)/)) {
            return 'angry';
        }

        // Sad
        if (lowerText.match(/(sedih|kecewa|hancur|terpukul|menangis)/)) {
            return 'sad';
        }

        // Confused
        if (lowerText.match(/(bingung|tidak tahu|gimana|bagaimana|kenapa)/)) {
            return 'confused';
        }

        return 'calm';
    }

    function detectIncidentMention(text) {
        const incidentKeywords = [
            'kejadian', 'terjadi', 'alami', 'korban', 'pelaku',
            'pelecehan', 'kekerasan', 'bully', 'dilecehkan', 'dipukul',
            'dosen', 'teman', 'senior', 'disakiti',
        ];

        const lowerText = text.toLowerCase();
        return incidentKeywords.some(keyword => lowerText.includes(keyword));
    }

    async function generateSupportiveResponse(text) {
        window.ChatBot.hideTypingIndicator();

        let response = '';

        // Use Groq API for intelligent empathetic responses
        if (window.GroqAPI && CurhatState.turnCount >= 2) {
            try {
                console.log('[CurhatMode] Calling Groq API for empathetic response...');

                // Call Groq API with conversation history
                response = await window.GroqAPI.generateCurhatResponse(
                    text,
                    CurhatState.conversationHistory
                );

                console.log('[CurhatMode] Groq API response received');

            } catch (error) {
                console.error('[CurhatMode] Groq API failed, using fallback:', error);
                // Fallback to static responses
                response = getFallbackResponse(text);
            }
        } else {
            // First message or Groq not available - use static responses
            response = getFallbackResponse(text);
        }

        // Add bot response to history
        CurhatState.conversationHistory.push({
            role: 'bot',
            text: response,
            timestamp: new Date().toISOString(),
        });

        window.ChatBot.addBotMessage(response);

        // After 5+ turns, offer to create report if incident was shared
        if (CurhatState.turnCount >= 5 && CurhatState.hasSharedIncident && !CurhatState.shouldOfferReport) {
            CurhatState.shouldOfferReport = true;

            setTimeout(() => {
                offerReportCreation();
            }, 3000);
        }
    }

    /**
     * Fallback response jika Groq API tidak tersedia atau gagal
     */
    function getFallbackResponse(text) {
        let response = '';

        if (CurhatState.turnCount === 1) {
            // First response - pure listening
            response = getRandomResponse(SUPPORTIVE_RESPONSES.listening);

        } else if (CurhatState.turnCount === 2) {
            // Second response - empathy
            response = getRandomResponse(SUPPORTIVE_RESPONSES.empathy);

        } else if (CurhatState.turnCount === 3) {
            // Third response - validation
            response = getRandomResponse(SUPPORTIVE_RESPONSES.validation);

            // After validation, ask if they want to continue
            setTimeout(() => {
                window.ChatBot.addBotMessage('Apakah ada hal lain yang ingin Anda ceritakan?');
            }, 2000);

        } else {
            // Subsequent responses - context aware
            response = generateContextualResponse(text);
        }

        return response;
    }

    function generateContextualResponse(text) {
        const lowerText = text.toLowerCase();

        // If asking for advice
        if (lowerText.match(/(bagaimana|gimana|harus|apa yang|saran)/)) {
            return 'Setiap situasi unik, tapi yang penting Anda tidak sendiri. Anda bisa mempertimbangkan untuk berbicara dengan konselor profesional, melaporkan kejadian jika ada, atau mencari dukungan dari orang-orang terdekat yang Anda percaya.';
        }

        // If expressing fear
        if (lowerText.match(/(takut|khawatir|cemas)/)) {
            return 'Rasa takut dan cemas yang Anda rasakan sangat wajar. Ingat bahwa Anda berada di ruang yang aman sekarang. Kami di sini untuk mendukung Anda dan memastikan Anda mendapat bantuan yang diperlukan.';
        }

        // If expressing guilt/shame
        if (lowerText.match(/(salah saya|malu|bodoh|seharusnya)/)) {
            return 'Tolong jangan menyalahkan diri sendiri. Apa yang terjadi BUKAN salah Anda. Tidak ada yang meminta atau pantas mendapat perlakuan buruk. Anda adalah korban, bukan penyebab.';
        }

        // If mentioning perpetrator
        if (lowerText.match(/(pelaku|dia|mereka|orang itu)/)) {
            return 'Yang dilakukan pelaku adalah tindakan yang salah dan tidak dapat dibenarkan. Anda berhak untuk merasa aman dan mendapat keadilan.';
        }

        // Default contextual response
        return getRandomResponse([
            ...SUPPORTIVE_RESPONSES.listening,
            ...SUPPORTIVE_RESPONSES.empathy,
        ]);
    }

    function offerReportCreation() {
        window.ChatBot.addBotMessage('Terima kasih sudah mau berbagi dengan saya. Berdasarkan cerita Anda, sepertinya ada kejadian yang perlu ditindaklanjuti.');

        setTimeout(() => {
            const options = {
                quickActions: [
                    {
                        label: 'Ya, Buat Laporan',
                        callback: () => startReportProcess(),
                    },
                    {
                        label: 'Tidak, Terima Kasih',
                        callback: () => declineReport(),
                    },
                    {
                        label: 'Nanti Saja',
                        callback: () => postponeReport(),
                    },
                ],
            };

            window.ChatBot.addBotMessage('Apakah Anda ingin membuat laporan resmi? Laporan akan membantu tim kami mengambil tindakan yang tepat.', options);
        }, 1500);
    }

    function startReportProcess() {
        window.ChatBot.addUserMessage('Ya, Buat Laporan');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Baik, saya akan memandu Anda membuat laporan dengan pertanyaan terstruktur.');

            setTimeout(() => {
                // Switch to Guided Mode
                if (window.GuidedMode) {
                    window.GuidedMode.start();
                } else {
                    window.ChatBot.addBotMessage('Maaf, mode pelaporan belum tersedia. Silakan refresh halaman atau hubungi admin.');
                }
            }, 1000);
        }, 800);
    }


    function declineReport() {
        window.ChatBot.addUserMessage('Tidak, Terima Kasih');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Tidak masalah. Keputusan ada di tangan Anda. Jika suatu saat Anda berubah pikiran, kami siap membantu.');

            setTimeout(() => {
                window.ChatBot.addBotMessage('Apakah ada hal lain yang ingin Anda ceritakan atau tanyakan?');
            }, 1500);
        }, 800);
    }

    function postponeReport() {
        window.ChatBot.addUserMessage('Nanti Saja');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Baik, tidak masalah. Ambil waktu yang Anda butuhkan. Saya akan tetap di sini jika Anda ingin melanjutkan percakapan.');

            setTimeout(() => {
                window.ChatBot.addBotMessage('Ingat, Anda bisa membuat laporan kapan saja ketika Anda siap.');
            }, 1500);
        }, 800);
    }

    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // =====================================================
    // Export Public API
    // =====================================================
    window.CurhatMode = {
        start,
        handleUserMessage,
    };

})();
