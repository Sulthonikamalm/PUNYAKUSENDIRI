/**
 * =====================================================
 * GUIDED MODE - Smart Reporting System
 * Structured step-by-step reporting with strict validation
 * Auto-detects dates, validates answers, generates clean reports
 * =====================================================
 */

(function() {
    'use strict';

    // =====================================================
    // State Management
    // =====================================================
    const GuidedState = {
        currentStep: 0,
        isWaitingForCorrection: false,
        reportData: {
            nama: '',
            jenisKelamin: '',
            tanggalKejadian: '',
            hariKejadian: '',
            lokasiKejadian: '',
            kronologi: '',
            kategori: '',
            timestamp: null,
            resumeLaporan: '',
        },
    };

    // =====================================================
    // Question Flow - Pertanyaan dengan Validation Rules
    // =====================================================
    const QuestionFlow = [
        {
            id: 'nama',
            question: 'Halo! Aku akan bantu kamu buat laporan. Mari kita mulai 📋\n\nSiapa nama lengkap kamu?',
            field: 'nama',
            validation: {
                type: 'text',
                minLength: 3,
                pattern: /^[a-zA-Z\s.]+$/,
                errorMessage: 'Nama harus minimal 3 karakter dan hanya berisi huruf.',
            },
            placeholder: 'Contoh: Ahmad Yusuf',
        },
        {
            id: 'jenisKelamin',
            question: 'Jenis kelamin kamu?',
            field: 'jenisKelamin',
            validation: {
                type: 'choice',
                options: ['Laki-laki', 'Perempuan'],
                caseSensitive: false,
                errorMessage: 'Pilihan hanya: "Laki-laki" atau "Perempuan".',
            },
            quickActions: [
                { label: '👨 Laki-laki', value: 'Laki-laki' },
                { label: '👩 Perempuan', value: 'Perempuan' },
            ],
        },
        {
            id: 'tanggalKejadian',
            question: 'Kapan kejadian ini terjadi?\n\nKamu bisa ketik tanggal lengkap, atau kata seperti "hari ini", "kemarin", "besok".',
            field: 'tanggalKejadian',
            validation: {
                type: 'date',
                errorMessage: 'Format tanggal tidak valid. Coba ketik "hari ini", "kemarin", atau format DD-MM-YYYY.',
            },
            placeholder: 'Contoh: hari ini / kemarin / 14-11-2025',
        },
        {
            id: 'lokasiKejadian',
            question: 'Di mana lokasi kejadian?',
            field: 'lokasiKejadian',
            validation: {
                type: 'text',
                minLength: 5,
                errorMessage: 'Lokasi harus minimal 5 karakter.',
            },
            placeholder: 'Contoh: Gedung A lantai 2 / Jl. Merdeka No.10',
        },
        {
            id: 'kronologi',
            question: 'Ceritakan kronologi kejadian secara singkat.',
            field: 'kronologi',
            validation: {
                type: 'text',
                minLength: 20,
                maxLength: 500,
                errorMessage: 'Kronologi harus minimal 20 karakter dan maksimal 500 karakter.',
            },
            placeholder: 'Jelaskan kejadian dari awal sampai akhir...',
        },
        {
            id: 'kategori',
            question: 'Kategori laporan kamu?',
            field: 'kategori',
            validation: {
                type: 'choice',
                options: [
                    'Pelecehan Seksual',
                    'Kekerasan Fisik',
                    'Kekerasan Psikis',
                    'Perundungan',
                    'Lainnya',
                ],
                caseSensitive: false,
                errorMessage: 'Pilih salah satu kategori yang tersedia.',
            },
            quickActions: [
                { label: '⚠️ Pelecehan Seksual', value: 'Pelecehan Seksual' },
                { label: '👊 Kekerasan Fisik', value: 'Kekerasan Fisik' },
                { label: '🧠 Kekerasan Psikis', value: 'Kekerasan Psikis' },
                { label: '😢 Perundungan', value: 'Perundungan' },
                { label: '📋 Lainnya', value: 'Lainnya' },
            ],
        },
    ];

    // =====================================================
    // Date Resolver - Auto-detect & Parse Dates
    // =====================================================
    const DateResolver = {
        /**
         * Parse user input menjadi tanggal & hari
         * @param {string} input - User input (hari ini, kemarin, besok, DD-MM-YYYY)
         * @returns {Object} { tanggal: 'YYYY-MM-DD', hari: 'Jumat', displayText: '14 November 2025, Jumat' }
         */
        parse: function(input) {
            const lowerInput = input.toLowerCase().trim();
            let targetDate = new Date();

            // Deteksi keyword
            if (lowerInput.includes('hari ini') || lowerInput === 'sekarang' || lowerInput === 'today') {
                // Hari ini
                targetDate = new Date();
            } else if (lowerInput.includes('kemarin') || lowerInput === 'yesterday') {
                // Kemarin
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - 1);
            } else if (lowerInput.includes('besok') || lowerInput === 'tomorrow') {
                // Besok
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + 1);
            } else if (lowerInput.includes('lusa')) {
                // Lusa
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + 2);
            } else if (lowerInput.match(/(\d+)\s*hari\s*(yang\s*)?(lalu|kemarin)/)) {
                // "3 hari lalu", "5 hari yang lalu"
                const match = lowerInput.match(/(\d+)\s*hari/);
                const days = parseInt(match[1]);
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - days);
            } else if (lowerInput.match(/(\d+)\s*hari\s*(yang\s*)?(akan datang|ke depan|lagi)/)) {
                // "3 hari lagi", "5 hari ke depan"
                const match = lowerInput.match(/(\d+)\s*hari/);
                const days = parseInt(match[1]);
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + days);
            } else {
                // Try parse as date string
                targetDate = this.parseCustomDate(input);
                if (!targetDate) {
                    return null; // Invalid date
                }
            }

            // Format output
            const tanggal = this.formatDateISO(targetDate);
            const hari = this.getDayName(targetDate);
            const displayText = this.formatDateDisplay(targetDate);

            return {
                tanggal: tanggal,
                hari: hari,
                displayText: displayText,
            };
        },

        /**
         * Parse custom date formats (DD-MM-YYYY, DD/MM/YYYY, DD MM YYYY)
         */
        parseCustomDate: function(input) {
            // Try DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
            const patterns = [
                /(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/,  // DD-MM-YYYY
                /(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/,  // YYYY-MM-DD
            ];

            for (let pattern of patterns) {
                const match = input.match(pattern);
                if (match) {
                    let day, month, year;

                    if (match[3].length === 4) {
                        // DD-MM-YYYY format
                        day = parseInt(match[1]);
                        month = parseInt(match[2]) - 1; // JS months are 0-indexed
                        year = parseInt(match[3]);
                    } else {
                        // YYYY-MM-DD format
                        year = parseInt(match[1]);
                        month = parseInt(match[2]) - 1;
                        day = parseInt(match[3]);
                    }

                    const date = new Date(year, month, day);

                    // Validate date
                    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                        return date;
                    }
                }
            }

            // Try native Date parse as last resort
            const nativeDate = new Date(input);
            if (!isNaN(nativeDate.getTime())) {
                return nativeDate;
            }

            return null;
        },

        /**
         * Format date as YYYY-MM-DD
         */
        formatDateISO: function(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        /**
         * Get day name in Indonesian
         */
        getDayName: function(date) {
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            return days[date.getDay()];
        },

        /**
         * Format date for display: "14 November 2025, Jumat"
         */
        formatDateDisplay: function(date) {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];

            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const dayName = this.getDayName(date);

            return `${day} ${month} ${year}, ${dayName}`;
        },
    };

    // =====================================================
    // Answer Validator - Validate User Answers
    // =====================================================
    const AnswerValidator = {
        /**
         * Validate answer based on question validation rules
         * @param {string} answer - User's answer
         * @param {Object} validationRules - Validation rules from question
         * @returns {Object} { valid: boolean, normalized: string, error: string }
         */
        validate: function(answer, validationRules) {
            const trimmedAnswer = answer.trim();

            // Empty check
            if (!trimmedAnswer) {
                return {
                    valid: false,
                    error: 'Jawaban tidak boleh kosong.',
                };
            }

            switch (validationRules.type) {
                case 'text':
                    return this.validateText(trimmedAnswer, validationRules);

                case 'choice':
                    return this.validateChoice(trimmedAnswer, validationRules);

                case 'date':
                    return this.validateDate(trimmedAnswer, validationRules);

                default:
                    return { valid: true, normalized: trimmedAnswer };
            }
        },

        validateText: function(answer, rules) {
            // Min length
            if (rules.minLength && answer.length < rules.minLength) {
                return {
                    valid: false,
                    error: rules.errorMessage || `Minimal ${rules.minLength} karakter.`,
                };
            }

            // Max length
            if (rules.maxLength && answer.length > rules.maxLength) {
                return {
                    valid: false,
                    error: rules.errorMessage || `Maksimal ${rules.maxLength} karakter.`,
                };
            }

            // Pattern matching
            if (rules.pattern && !rules.pattern.test(answer)) {
                return {
                    valid: false,
                    error: rules.errorMessage || 'Format tidak valid.',
                };
            }

            return { valid: true, normalized: answer };
        },

        validateChoice: function(answer, rules) {
            const normalizedAnswer = rules.caseSensitive ? answer : answer.toLowerCase();
            const options = rules.caseSensitive ? rules.options : rules.options.map(opt => opt.toLowerCase());

            const matchedIndex = options.findIndex(opt => {
                const normalizedOpt = rules.caseSensitive ? opt : opt.toLowerCase();
                return normalizedOpt === normalizedAnswer || normalizedAnswer.includes(normalizedOpt);
            });

            if (matchedIndex === -1) {
                return {
                    valid: false,
                    error: rules.errorMessage || `Pilihan tidak valid. Opsi: ${rules.options.join(', ')}`,
                };
            }

            // Return original option (proper case)
            return { valid: true, normalized: rules.options[matchedIndex] };
        },

        validateDate: function(answer, rules) {
            const parsedDate = DateResolver.parse(answer);

            if (!parsedDate) {
                return {
                    valid: false,
                    error: rules.errorMessage || 'Format tanggal tidak valid.',
                };
            }

            return {
                valid: true,
                normalized: parsedDate.displayText,
                dateData: parsedDate,
            };
        },
    };

    // =====================================================
    // Report Builder - Generate Clean Report Summary
    // =====================================================
    const ReportBuilder = {
        /**
         * Build final report summary
         * @param {Object} data - Report data
         * @returns {string} Clean summary
         */
        buildSummary: function(data) {
            let summary = '';
            summary += `Laporan dari ${data.nama} (${data.jenisKelamin}) `;
            summary += `tentang ${data.kategori} `;
            summary += `di ${data.lokasiKejadian} `;
            summary += `pada ${data.hariKejadian}, ${data.tanggalKejadian}. `;
            summary += `\n\nKronologi: ${data.kronologi}`;

            return summary;
        },

        /**
         * Build detailed report for display
         */
        buildDetailedReport: function(data) {
            let report = '';
            report += `\n━━━━━━━━━━━━━━━━━━\n`;
            report += `📋 RINGKASAN LAPORAN\n`;
            report += `━━━━━━━━━━━━━━━━━━\n\n`;
            report += `👤 Nama: ${data.nama}\n`;
            report += `⚧️ Jenis Kelamin: ${data.jenisKelamin}\n`;
            report += `📅 Tanggal Kejadian: ${data.tanggalKejadian} (${data.hariKejadian})\n`;
            report += `📍 Lokasi: ${data.lokasiKejadian}\n`;
            report += `📂 Kategori: ${data.kategori}\n`;
            report += `\n📝 Kronologi:\n${data.kronologi}\n`;
            report += `\n━━━━━━━━━━━━━━━━━━\n`;

            return report;
        },
    };

    // =====================================================
    // DB Handler - Save Report to Database
    // =====================================================
    const DBHandler = {
        /**
         * Save report to backend Laravel API
         * @param {Object} data - Report data
         * @returns {Promise<Object>} Response from API
         */
        saveReport: async function(data) {
            try {
                // TODO: Ganti URL dengan endpoint Laravel API
                const API_ENDPOINT = '/api/reports/chatbot-guided';

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        // Add auth header if needed
                        // 'Authorization': 'Bearer ' + yourToken,
                    },
                    body: JSON.stringify({
                        source: 'chatbot_guided',
                        ...data,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                return {
                    success: true,
                    data: result,
                };

            } catch (error) {
                console.error('[DBHandler] Error saving report:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        },

        /**
         * Fallback: Save to localStorage if API fails
         */
        saveToLocalStorage: function(data) {
            try {
                const reports = JSON.parse(localStorage.getItem('chatbot_reports') || '[]');
                reports.push(data);
                localStorage.setItem('chatbot_reports', JSON.stringify(reports));
                return true;
            } catch (error) {
                console.error('[DBHandler] LocalStorage error:', error);
                return false;
            }
        },
    };

    // =====================================================
    // Guided Mode Functions
    // =====================================================
    function start() {
        // Reset state
        GuidedState.currentStep = 0;
        GuidedState.isWaitingForCorrection = false;
        GuidedState.reportData = {
            nama: '',
            jenisKelamin: '',
            tanggalKejadian: '',
            hariKejadian: '',
            lokasiKejadian: '',
            kronologi: '',
            kategori: '',
            timestamp: null,
            resumeLaporan: '',
        };

        // Ask first question
        setTimeout(() => {
            askCurrentQuestion();
        }, 500);
    }

    function askCurrentQuestion() {
        const question = QuestionFlow[GuidedState.currentStep];

        if (!question) {
            // All questions answered - complete report
            completeReport();
            return;
        }

        const options = {};

        // Add quick action buttons if available
        if (question.quickActions) {
            options.quickActions = question.quickActions.map(action => ({
                label: action.label,
                callback: () => handleQuickAction(action.value),
            }));
        }

        window.ChatBot.hideTypingIndicator();
        window.ChatBot.addBotMessage(question.question, options);
    }

    function handleUserMessage(text) {
        const question = QuestionFlow[GuidedState.currentStep];

        if (!question) return;

        // Validate answer
        const validationResult = AnswerValidator.validate(text, question.validation);

        if (!validationResult.valid) {
            // Invalid answer - ask for correction
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage(`❌ ${validationResult.error}\n\nSilakan coba lagi.`);
            GuidedState.isWaitingForCorrection = true;
            return;
        }

        // Valid answer - store it
        if (question.field === 'tanggalKejadian' && validationResult.dateData) {
            // Special handling for date
            GuidedState.reportData.tanggalKejadian = validationResult.dateData.tanggal;
            GuidedState.reportData.hariKejadian = validationResult.dateData.hari;

            // Confirm to user
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage(`✅ Tanggal dicatat: ${validationResult.dateData.displayText}`);
        } else {
            // Normal field
            GuidedState.reportData[question.field] = validationResult.normalized;
        }

        // Move to next question
        GuidedState.currentStep++;
        GuidedState.isWaitingForCorrection = false;

        // Show typing indicator and ask next question
        window.ChatBot.showTypingIndicator();
        setTimeout(() => {
            askCurrentQuestion();
        }, 1000);
    }

    function handleQuickAction(value) {
        const question = QuestionFlow[GuidedState.currentStep];

        if (!question) return;

        // Simulate user message
        window.ChatBot.addUserMessage(value);

        // Validate quick action value (should always be valid)
        const validationResult = AnswerValidator.validate(value, question.validation);

        if (!validationResult.valid) {
            console.error('[GuidedMode] Quick action value is invalid:', value);
            return;
        }

        // Store value
        GuidedState.reportData[question.field] = validationResult.normalized;

        // Move to next question
        GuidedState.currentStep++;

        // Show typing indicator and ask next question
        window.ChatBot.showTypingIndicator();
        setTimeout(() => {
            askCurrentQuestion();
        }, 1200);
    }

    function completeReport() {
        // Add timestamp
        GuidedState.reportData.timestamp = new Date().toISOString();

        // Build resume
        GuidedState.reportData.resumeLaporan = ReportBuilder.buildSummary(GuidedState.reportData);

        // Show summary
        window.ChatBot.hideTypingIndicator();
        window.ChatBot.addBotMessage('Makasih udah melengkapi semua informasi! Ini ringkasan laporan kamu:');

        setTimeout(() => {
            const detailedReport = ReportBuilder.buildDetailedReport(GuidedState.reportData);
            window.ChatBot.addBotMessage(detailedReport);

            setTimeout(() => {
                const confirmOptions = {
                    quickActions: [
                        {
                            label: '✅ Kirim Laporan',
                            callback: submitReport,
                        },
                        {
                            label: '✏️ Koreksi Data',
                            callback: offerCorrection,
                        },
                    ],
                };

                window.ChatBot.addBotMessage('Silakan cek ringkasan di atas. Kalau sudah benar, klik tombol "Kirim Laporan".', confirmOptions);
            }, 1500);
        }, 800);
    }

    function offerCorrection() {
        window.ChatBot.addUserMessage('✏️ Koreksi Data');
        window.ChatBot.showTypingIndicator();

        setTimeout(() => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Maaf, fitur koreksi belum tersedia. Kamu bisa mulai ulang dengan klik "Kembali ke Mode" atau lanjut kirim laporan ini.');
        }, 800);
    }

    async function submitReport() {
        window.ChatBot.addUserMessage('✅ Kirim Laporan');
        window.ChatBot.showTypingIndicator();

        // Show loading message
        setTimeout(async () => {
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('⏳ Sedang mengirim laporan...');

            // Save to database
            const result = await DBHandler.saveReport(GuidedState.reportData);

            window.ChatBot.showTypingIndicator();
            setTimeout(() => {
                window.ChatBot.hideTypingIndicator();

                if (result.success) {
                    // Success
                    const reportId = result.data?.reportId || 'PPKS' + Date.now();
                    window.ChatBot.addBotMessage(`✅ Laporan berhasil dikirim!\n\nID Laporan: ${reportId}`);

                    setTimeout(() => {
                        window.ChatBot.addBotMessage('Tim kami akan segera menindaklanjuti laporan kamu. Kamu bisa cek status laporan di menu Monitoring.');

                        setTimeout(() => {
                            window.ChatBot.addBotMessage('Terima kasih atas kepercayaan kamu. Jika ada pertanyaan, jangan ragu untuk hubungi kami.');
                        }, 1500);
                    }, 1000);

                } else {
                    // Failed - try localStorage
                    const localSaved = DBHandler.saveToLocalStorage(GuidedState.reportData);

                    if (localSaved) {
                        window.ChatBot.addBotMessage('⚠️ Koneksi ke server gagal, tapi laporan kamu sudah disimpan sementara di perangkat ini.');
                        setTimeout(() => {
                            window.ChatBot.addBotMessage('Tim kami akan mengambil data laporan nanti. Terima kasih!');
                        }, 1500);
                    } else {
                        window.ChatBot.addBotMessage('❌ Maaf, terjadi kesalahan saat mengirim laporan. Silakan coba lagi atau gunakan form manual.');
                    }
                }
            }, 1500);
        }, 1000);
    }

    // =====================================================
    // Export Public API
    // =====================================================
    window.GuidedMode = {
        start,
        handleUserMessage,

        // Debug helpers
        getState: () => ({ ...GuidedState }),
        testDateResolver: (input) => DateResolver.parse(input),
    };

    console.log('[GuidedMode] Initialized - Smart Reporting System');

})();
