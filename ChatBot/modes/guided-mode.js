/**
 * =====================================================
 * GUIDED MODE - Structured Step-by-Step Reporting
 * Asks predefined questions in sequence
 * =====================================================
 */

(function() {
    'use strict';

    // =====================================================
    // Guided Mode State
    // =====================================================
    const GuidedState = {
        currentStep: 0,
        formData: {
            identitas: '', // 'Anonim' or nama
            hubungan: '',
            jenisKejadian: '',
            lokasiKejadian: '',
            tanggalKejadian: '',
            detailKejadian: '',
            kronologi: '',
            dampak: '',
            harapan: '',
        },
        steps: [
            {
                question: 'Pertama, apakah Anda ingin melaporkan secara anonim atau menggunakan nama?',
                field: 'identitas',
                quickActions: [
                    { label: 'Anonim', value: 'Anonim' },
                    { label: 'Gunakan Nama', value: 'nama' }
                ],
            },
            {
                question: 'Anda adalah?',
                field: 'hubungan',
                quickActions: [
                    { label: 'Korban', value: 'Korban' },
                    { label: 'Saksi', value: 'Saksi' },
                    { label: 'Pihak Lain', value: 'Pihak Lain' }
                ],
            },
            {
                question: 'Apa jenis kejadian yang ingin Anda laporkan?',
                field: 'jenisKejadian',
                quickActions: [
                    { label: 'Pelecehan Seksual', value: 'Pelecehan Seksual' },
                    { label: 'Kekerasan Fisik', value: 'Kekerasan Fisik' },
                    { label: 'Kekerasan Psikis', value: 'Kekerasan Psikis' },
                    { label: 'Perundungan', value: 'Perundungan' },
                    { label: 'Lainnya', value: 'Lainnya' }
                ],
            },
            {
                question: 'Di mana kejadian ini terjadi?',
                field: 'lokasiKejadian',
                placeholder: 'Contoh: Gedung A lantai 2, Laboratorium, dll.',
            },
            {
                question: 'Kapan kejadian ini terjadi? (Tanggal atau perkiraan)',
                field: 'tanggalKejadian',
                placeholder: 'Contoh: 15 Januari 2025, atau "Minggu lalu"',
            },
            {
                question: 'Ceritakan secara singkat apa yang terjadi.',
                field: 'detailKejadian',
                placeholder: 'Jelaskan kejadian secara singkat...',
            },
            {
                question: 'Bisakah Anda menceritakan kronologi atau urutan kejadian secara lebih detail?',
                field: 'kronologi',
                placeholder: 'Jelaskan urutan kejadian dari awal sampai akhir...',
            },
            {
                question: 'Bagaimana dampak kejadian ini terhadap Anda atau korban?',
                field: 'dampak',
                placeholder: 'Contoh: trauma, takut, sulit fokus belajar, dll.',
            },
            {
                question: 'Apa harapan Anda setelah membuat laporan ini?',
                field: 'harapan',
                placeholder: 'Contoh: pelaku ditindak, konseling, pendampingan, dll.',
            },
        ],
    };

    // =====================================================
    // Guided Mode Functions
    // =====================================================
    function start() {
        // Reset state
        GuidedState.currentStep = 0;
        GuidedState.formData = {
            identitas: '',
            hubungan: '',
            jenisKejadian: '',
            lokasiKejadian: '',
            tanggalKejadian: '',
            detailKejadian: '',
            kronologi: '',
            dampak: '',
            harapan: '',
        };

        // Ask first question
        setTimeout(() => {
            askCurrentQuestion();
        }, 500);
    }

    function askCurrentQuestion() {
        const step = GuidedState.steps[GuidedState.currentStep];

        if (!step) {
            // All questions answered - submit report
            completeReport();
            return;
        }

        const options = {};

        // Add quick action buttons if available
        if (step.quickActions) {
            options.quickActions = step.quickActions.map(action => ({
                label: action.label,
                callback: () => handleQuickAction(action.value),
            }));
        }

        window.ChatBot.hideTypingIndicator();
        window.ChatBot.addBotMessage(step.question, options);
    }

    function handleUserMessage(text) {
        const step = GuidedState.steps[GuidedState.currentStep];

        if (!step) return;

        // Store answer
        GuidedState.formData[step.field] = text;

        // Handle special cases
        if (step.field === 'identitas' && text.toLowerCase().includes('nama')) {
            // Ask for name
            window.ChatBot.hideTypingIndicator();
            window.ChatBot.addBotMessage('Silakan ketik nama lengkap Anda:');

            // Create a special state to wait for name input
            GuidedState.waitingForName = true;
            return;
        }

        // Move to next question
        GuidedState.currentStep++;

        // Show typing indicator and ask next question
        window.ChatBot.showTypingIndicator();
        setTimeout(() => {
            askCurrentQuestion();
        }, 1000);
    }

    function handleQuickAction(value) {
        const step = GuidedState.steps[GuidedState.currentStep];

        if (!step) return;

        // Simulate user message
        window.ChatBot.addUserMessage(value);

        // Store answer
        GuidedState.formData[step.field] = value;

        // Handle special cases
        if (step.field === 'identitas' && value === 'nama') {
            // Ask for name
            window.ChatBot.showTypingIndicator();
            setTimeout(() => {
                window.ChatBot.hideTypingIndicator();
                window.ChatBot.addBotMessage('Silakan ketik nama lengkap Anda:');
            }, 800);

            GuidedState.waitingForName = true;
            return;
        }

        // Move to next question
        GuidedState.currentStep++;

        // Show typing indicator and ask next question
        window.ChatBot.showTypingIndicator();
        setTimeout(() => {
            askCurrentQuestion();
        }, 1200);
    }

    function completeReport() {
        window.ChatBot.hideTypingIndicator();

        // Show summary
        const summary = generateSummary();
        window.ChatBot.addBotMessage('Terima kasih telah melengkapi semua informasi. Berikut ringkasan laporan Anda:');

        setTimeout(() => {
            window.ChatBot.addBotMessage(summary);

            setTimeout(() => {
                const confirmOptions = {
                    quickActions: [
                        {
                            label: '✅ Kirim Laporan',
                            callback: submitReport,
                        },
                    ],
                };

                window.ChatBot.addBotMessage('Silakan periksa ringkasan laporan di atas. Jika sudah sesuai, klik tombol di bawah untuk mengirim laporan.', confirmOptions);
            }, 1500);
        }, 800);
    }

    function generateSummary() {
        const data = GuidedState.formData;

        let summary = '';
        summary += `\n━━━━━━━━━━━━━━━━━━\n`;
        summary += `📋 RINGKASAN LAPORAN\n`;
        summary += `━━━━━━━━━━━━━━━━━━\n\n`;

        if (data.identitas) summary += `👤 Identitas: ${data.identitas}\n`;
        if (data.hubungan) summary += `🔗 Hubungan: ${data.hubungan}\n`;
        if (data.jenisKejadian) summary += `⚠️ Jenis: ${data.jenisKejadian}\n`;
        if (data.lokasiKejadian) summary += `📍 Lokasi: ${data.lokasiKejadian}\n`;
        if (data.tanggalKejadian) summary += `📅 Tanggal: ${data.tanggalKejadian}\n`;
        if (data.detailKejadian) summary += `\n📝 Detail: ${data.detailKejadian}\n`;
        if (data.kronologi) summary += `\n🔄 Kronologi: ${data.kronologi}\n`;
        if (data.dampak) summary += `\n💔 Dampak: ${data.dampak}\n`;
        if (data.harapan) summary += `\n✨ Harapan: ${data.harapan}\n`;

        summary += `\n━━━━━━━━━━━━━━━━━━\n`;

        return summary;
    }

    function submitReport() {
        window.ChatBot.addUserMessage('Kirim Laporan');
        window.ChatBot.showTypingIndicator();

        // Simulate API call
        setTimeout(async () => {
            try {
                // TODO: Implement actual API call to Laravel backend
                // const response = await fetch('/api/reports/chatbot', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({
                //         source: 'chatbot_guided',
                //         ...GuidedState.formData,
                //     }),
                // });

                window.ChatBot.hideTypingIndicator();
                window.ChatBot.addBotMessage('✅ Laporan Anda berhasil dikirim!');

                setTimeout(() => {
                    window.ChatBot.addBotMessage('Tim kami akan segera menindaklanjuti laporan Anda. Anda akan menerima nomor tiket laporan melalui email/notifikasi.');

                    setTimeout(() => {
                        window.ChatBot.addBotMessage('Terima kasih atas kepercayaan Anda. Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.');
                    }, 1500);
                }, 1000);

            } catch (error) {
                window.ChatBot.hideTypingIndicator();
                window.ChatBot.addBotMessage('❌ Maaf, terjadi kesalahan saat mengirim laporan. Silakan coba lagi atau gunakan form manual.');
            }
        }, 2000);
    }

    // =====================================================
    // Export Public API
    // =====================================================
    window.GuidedMode = {
        start,
        handleUserMessage,
    };

})();
