// ============================================
// LAPOR FORM JAVASCRIPT
// Clean, Modular, Accessible
// ============================================

(function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let currentStep = 1;
    const totalSteps = 5;
    const formData = {};

    // Track step 2 selections (needs both)
    const step2Status = {
        korban: false,
        kehawatiran: false
    };

    // File upload state
    const uploadedFiles = [];
    const MAX_FILES = 5;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
    const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const progressBar = document.getElementById('progressBar');
    const currentStepNumber = document.getElementById('currentStepNumber');
    const formSteps = document.querySelectorAll('.form-step');

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        // Require authentication
        if (!authManager.requireAuth()) {
            return; // Will redirect to login
        }

        console.log('✅ User authenticated:', authManager.getCurrentUser().name);

        initChoiceCards();
        initStep1();
        initStep2();
        initStep3();
        initStep4();
        initStep5();
        console.log('✅ Lapor Form Initialized');
    }

    // ============================================
    // CHOICE CARDS HANDLER (Step 1 & 2)
    // ============================================
    function initChoiceCards() {
        const choiceCards = document.querySelectorAll('.lapor-choice');
        
        choiceCards.forEach(card => {
            card.addEventListener('click', function() {
                const radioInput = this.querySelector('input[type="radio"]');
                const radioName = radioInput.name;
                const groupName = this.getAttribute('data-group');
                
                // Remove selected from same group
                document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
                    radio.closest('.lapor-choice').classList.remove('selected');
                });
                
                // Add selected to clicked card
                this.classList.add('selected');
                radioInput.checked = true;
                
                // Store in formData
                formData[radioName] = this.getAttribute('data-value');
                
                // Handle different steps
                if (radioName === 'statusDarurat') {
                    handleStep1Selection();
                } else if (groupName) {
                    handleStep2Selection(groupName);
                }
            });
        });
    }

    // ============================================
    // STEP 1: KEADAAN DARURAT
    // ============================================
    function initStep1() {
        const btnLanjutkan1 = document.getElementById('btnLanjutkan1');
        
        if (btnLanjutkan1) {
            btnLanjutkan1.addEventListener('click', function() {
                if (formData.statusDarurat === 'darurat') {
                    redirectToWhatsApp();
                } else if (formData.statusDarurat === 'tidak') {
                    goToStep(2);
                }
            });
        }
    }

    function handleStep1Selection() {
        const btnLanjutkan1 = document.getElementById('btnLanjutkan1');
        
        if (btnLanjutkan1) {
            btnLanjutkan1.disabled = false;
        }
        
        // Auto-proceed after 500ms
        setTimeout(() => {
            if (formData.statusDarurat === 'darurat') {
                redirectToWhatsApp();
            } else if (formData.statusDarurat === 'tidak') {
                goToStep(2);
            }
        }, 500);
    }

    function redirectToWhatsApp() {
        const phoneNumber = '6282188467793';
        const message = encodeURIComponent('🚨 DARURAT! Saya membutuhkan bantuan segera dari Satgas PPKS.');
        window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
    }

    // ============================================
    // STEP 2: KORBAN & KEHAWATIRAN
    // ============================================
    function initStep2() {
        const btnKembali2 = document.getElementById('btnKembali2');
        const btnLanjutkan2 = document.getElementById('btnLanjutkan2');
        
        if (btnKembali2) {
            btnKembali2.addEventListener('click', function() {
                resetStep2();
                goToStep(1);
            });
        }
        
        if (btnLanjutkan2) {
            btnLanjutkan2.addEventListener('click', function() {
                if (step2Status.korban && step2Status.kehawatiran) {
                    console.log('Step 2 Complete:', formData);
                    goToStep(3);
                }
            });
        }
    }

    function handleStep2Selection(groupName) {
        if (groupName === 'korban') {
            step2Status.korban = true;
        } else if (groupName === 'kehawatiran') {
            step2Status.kehawatiran = true;
        }
        
        // Enable button if both selected
        const btnLanjutkan2 = document.getElementById('btnLanjutkan2');
        if (step2Status.korban && step2Status.kehawatiran) {
            if (btnLanjutkan2) {
                btnLanjutkan2.disabled = false;
            }
        }
    }

    function resetStep2() {
        step2Status.korban = false;
        step2Status.kehawatiran = false;
        
        const btnLanjutkan2 = document.getElementById('btnLanjutkan2');
        if (btnLanjutkan2) {
            btnLanjutkan2.disabled = true;
        }
    }

    // ============================================
    // STEP 3: GENDER KORBAN
    // ============================================
    function initStep3() {
        const genderRadios = document.querySelectorAll('input[name="genderKorban"]');
        const btnKembali3 = document.getElementById('btnKembali3');
        const btnLanjutkan3 = document.getElementById('btnLanjutkan3');
        
        genderRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    formData.genderKorban = this.value;
                    if (btnLanjutkan3) {
                        btnLanjutkan3.disabled = false;
                    }
                }
            });
        });
        
        if (btnKembali3) {
            btnKembali3.addEventListener('click', function() {
                goToStep(2);
            });
        }
        
        if (btnLanjutkan3) {
            btnLanjutkan3.addEventListener('click', function() {
                if (formData.genderKorban) {
                    console.log('Step 3 Complete:', formData);
                    goToStep(4);
                }
            });
        }
    }

    // ============================================
    // STEP 4: DATA KEJADIAN KEKERASAN
    // ============================================
    function initStep4() {
        const pelakuKekerasan = document.getElementById('pelakuKekerasan');
        const waktuKejadian = document.getElementById('waktuKejadian');
        const lokasiKejadian = document.getElementById('lokasiKejadian');
        const detailKejadian = document.getElementById('detailKejadian');
        const btnKembali4 = document.getElementById('btnKembali4');
        const btnLanjutkan4 = document.getElementById('btnLanjutkan4');
        
        // Add event listeners
        if (pelakuKekerasan) {
            pelakuKekerasan.addEventListener('change', function() {
                formData.pelakuKekerasan = this.value;
                validateStep4();
            });
            
            pelakuKekerasan.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorPelaku', this);
                } else {
                    hideError('errorPelaku', this);
                }
            });
        }
        
        if (waktuKejadian) {
            waktuKejadian.addEventListener('change', function() {
                formData.waktuKejadian = this.value;
                validateStep4();
            });
            
            waktuKejadian.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorWaktu', this);
                } else {
                    hideError('errorWaktu', this);
                }
            });
        }
        
        if (lokasiKejadian) {
            lokasiKejadian.addEventListener('change', function() {
                formData.lokasiKejadian = this.value;
                validateStep4();
            });
            
            lokasiKejadian.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorLokasi', this);
                } else {
                    hideError('errorLokasi', this);
                }
            });
        }
        
        if (detailKejadian) {
            detailKejadian.addEventListener('input', function() {
                formData.detailKejadian = this.value;
                validateStep4();
            });
            
            detailKejadian.addEventListener('blur', function() {
                if (this.value.trim().length < 10) {
                    showError('errorDetail', this);
                } else {
                    hideError('errorDetail', this);
                }
            });
        }
        
        if (btnKembali4) {
            btnKembali4.addEventListener('click', function() {
                goToStep(3);
            });
        }
        
        if (btnLanjutkan4) {
            btnLanjutkan4.addEventListener('click', function() {
                if (validateStep4()) {
                    console.log('Step 4 Complete:', formData);
                    goToStep(5);
                }
            });
        }

        // Initialize file upload
        initFileUpload();

        // Initialize voice input
        initVoiceInput();
    }

    function validateStep4() {
        const pelakuKekerasan = document.getElementById('pelakuKekerasan');
        const waktuKejadian = document.getElementById('waktuKejadian');
        const lokasiKejadian = document.getElementById('lokasiKejadian');
        const detailKejadian = document.getElementById('detailKejadian');
        const btnLanjutkan4 = document.getElementById('btnLanjutkan4');

        let isValid = true;

        // Validate Pelaku
        if (!pelakuKekerasan.value) {
            isValid = false;
        } else {
            hideError('errorPelaku', pelakuKekerasan);
        }
        
        // Validate Waktu
        if (!waktuKejadian.value) {
            isValid = false;
        } else {
            hideError('errorWaktu', waktuKejadian);
        }
        
        // Validate Lokasi
        if (!lokasiKejadian.value) {
            isValid = false;
        } else {
            hideError('errorLokasi', lokasiKejadian);
        }
        
        // Validate Detail (min 10 chars)
        const detailValue = detailKejadian.value.trim();
        if (detailValue.length < 10) {
            isValid = false;
        } else {
            hideError('errorDetail', detailKejadian);
        }

        // Validate Files (minimum 1 file required)
        if (uploadedFiles.length === 0) {
            isValid = false;
            showError('errorFiles', document.getElementById('fileInput'));
        } else {
            hideError('errorFiles', document.getElementById('fileInput'));
        }

        // Enable/disable button
        if (btnLanjutkan4) {
            btnLanjutkan4.disabled = !isValid;
        }

        return isValid;
    }

    // ============================================
    // STEP 5: INPUT DATA KORBAN
    // ============================================
    function initStep5() {
        const emailKorban = document.getElementById('emailKorban');
        const usiaKorban = document.getElementById('usiaKorban');
        const disabilitasYa = document.getElementById('disabilitasYa');
        const disabilitasTidak = document.getElementById('disabilitasTidak');
        const jenisDisabilitasContainer = document.getElementById('jenisDisabilitasContainer');
        const jenisDisabilitas = document.getElementById('jenisDisabilitas');
        const whatsappKorban = document.getElementById('whatsappKorban');
        const btnKembali5 = document.getElementById('btnKembali5');
        const btnKirimPengaduan = document.getElementById('btnKirimPengaduan');
        
        // Email validation
        if (emailKorban) {
            emailKorban.addEventListener('input', function() {
                formData.emailKorban = this.value;
                validateStep5();
            });
            
            emailKorban.addEventListener('blur', function() {
                const emailValue = this.value.trim();
                if (emailValue !== '' && !isValidEmail(emailValue)) {
                    showError('errorEmail', this);
                } else {
                    hideError('errorEmail', this);
                }
            });
        }
        
        // Usia validation
        if (usiaKorban) {
            usiaKorban.addEventListener('change', function() {
                formData.usiaKorban = this.value;
                validateStep5();
            });
            
            usiaKorban.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorUsia', this);
                } else {
                    hideError('errorUsia', this);
                }
            });
        }
        
        // Disabilitas radio
        if (disabilitasYa) {
            disabilitasYa.addEventListener('change', function() {
                if (this.checked) {
                    formData.disabilitasStatus = 'ya';
                    jenisDisabilitasContainer.classList.remove('hidden');
                    validateStep5();
                }
            });
        }
        
        if (disabilitasTidak) {
            disabilitasTidak.addEventListener('change', function() {
                if (this.checked) {
                    formData.disabilitasStatus = 'tidak';
                    jenisDisabilitasContainer.classList.add('hidden');
                    jenisDisabilitas.value = '';
                    formData.jenisDisabilitas = '';
                    hideError('errorDisabilitas', jenisDisabilitas);
                    validateStep5();
                }
            });
        }
        
        // Jenis Disabilitas
        if (jenisDisabilitas) {
            jenisDisabilitas.addEventListener('change', function() {
                formData.jenisDisabilitas = this.value;
                validateStep5();
            });
        }
        
        // WhatsApp validation
        if (whatsappKorban) {
            whatsappKorban.addEventListener('input', function() {
                formData.whatsappKorban = this.value;
                validateStep5();
            });
            
            whatsappKorban.addEventListener('blur', function() {
                const whatsappValue = this.value.trim();
                if (whatsappValue !== '' && !isValidPhone(whatsappValue)) {
                    showError('errorWhatsapp', this);
                } else {
                    hideError('errorWhatsapp', this);
                }
            });
        }
        
        // Back button
        if (btnKembali5) {
            btnKembali5.addEventListener('click', function() {
                goToStep(4);
            });
        }
        
        // Submit button
        if (btnKirimPengaduan) {
            btnKirimPengaduan.addEventListener('click', function() {
                if (validateStep5()) {
                    submitForm();
                }
            });
        }
    }

    function validateStep5() {
        const emailKorban = document.getElementById('emailKorban');
        const usiaKorban = document.getElementById('usiaKorban');
        const disabilitasYa = document.getElementById('disabilitasYa');
        const jenisDisabilitas = document.getElementById('jenisDisabilitas');
        const whatsappKorban = document.getElementById('whatsappKorban');
        const btnKirimPengaduan = document.getElementById('btnKirimPengaduan');
        
        let isValid = true;
        
        // Validate Email (optional but must be valid)
        const emailValue = emailKorban.value.trim();
        if (emailValue !== '' && !isValidEmail(emailValue)) {
            isValid = false;
        } else {
            hideError('errorEmail', emailKorban);
        }
        
        // Validate Usia (required)
        if (!usiaKorban.value) {
            isValid = false;
        } else {
            hideError('errorUsia', usiaKorban);
        }
        
        // Validate Jenis Disabilitas (required if disabilitasYa checked)
        if (disabilitasYa.checked && !jenisDisabilitas.value) {
            isValid = false;
        } else {
            hideError('errorDisabilitas', jenisDisabilitas);
        }
        
        // Validate WhatsApp (optional but must be valid)
        const    whatsappValue = whatsappKorban.value.trim();
        if (whatsappValue !== '' && !isValidPhone(whatsappValue)) {
            isValid = false;
        } else {
            hideError('errorWhatsapp', whatsappKorban);
        }
        
        // Enable/disable submit button
        if (btnKirimPengaduan) {
            btnKirimPengaduan.disabled = !isValid;
        }
        
        return isValid;
    }

    // ============================================
    // VALIDATION HELPERS
    // ============================================
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\+]/g, ''));
    }

    function showError(errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.add('show');
        }
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    function hideError(errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function goToStep(stepNumber) {
        // Hide all steps
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById('step' + stepNumber);
        if (targetStep) {
            targetStep.classList.add('active');
            currentStep = stepNumber;
            updateProgressBar(stepNumber);
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    function updateProgressBar(step) {
        const percentage = (step / totalSteps) * 100;
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        if (currentStepNumber) {
            currentStepNumber.textContent = step;
        }
    }

    // ============================================
    // VOICE INPUT - SPEECH TO TEXT
    // ============================================
    let recognition = null;
    let isRecording = false;

    function initVoiceInput() {
        const btnVoiceInput = document.getElementById('btnVoiceInput');
        const btnStopRecording = document.getElementById('btnStopRecording');
        const voiceRecordingIndicator = document.getElementById('voiceRecordingIndicator');
        const detailKejadian = document.getElementById('detailKejadian');

        if (!btnVoiceInput || !detailKejadian) {
            console.warn('Voice input elements not found');
            return;
        }

        // Check browser support for Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            btnVoiceInput.style.display = 'none';

            // Show warning message
            const warning = document.createElement('div');
            warning.className = 'voice-not-supported';
            warning.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Browser Anda tidak mendukung fitur voice input. Gunakan Chrome, Edge, atau Safari terbaru.</span>
            `;
            detailKejadian.parentElement.appendChild(warning);
            return;
        }

        // Initialize Speech Recognition
        recognition = new SpeechRecognition();
        recognition.lang = 'id-ID'; // Bahasa Indonesia
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true; // Show interim results

        console.log('✅ Voice Input Initialized');

        // Start recording button
        btnVoiceInput.addEventListener('click', function() {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });

        // Stop recording button
        if (btnStopRecording) {
            btnStopRecording.addEventListener('click', function() {
                stopRecording();
            });
        }

        // Recognition events
        recognition.onstart = function() {
            console.log('🎤 Recording started');
            isRecording = true;
            btnVoiceInput.classList.add('recording');
            if (voiceRecordingIndicator) {
                voiceRecordingIndicator.style.display = 'flex';
            }
        };

        recognition.onresult = function(event) {
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

            // Append final transcript to textarea
            if (finalTranscript) {
                const currentText = detailKejadian.value;
                const newText = currentText + (currentText ? ' ' : '') + finalTranscript.trim();
                detailKejadian.value = newText;

                // Trigger input event for validation
                detailKejadian.dispatchEvent(new Event('input'));
                formData.detailKejadian = newText;

                console.log('📝 Transcript:', finalTranscript.trim());
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech Recognition Error:', event.error);

            let errorMessage = 'Terjadi kesalahan saat merekam suara.';

            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'Tidak ada suara yang terdeteksi. Coba lagi.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Mikrofon tidak ditemukan. Periksa perangkat Anda.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Akses mikrofon ditolak. Izinkan akses mikrofon di browser.';
                    break;
                case 'network':
                    errorMessage = 'Koneksi internet bermasalah.';
                    break;
            }

            alert('❌ ' + errorMessage);
            stopRecording();
        };

        recognition.onend = function() {
            console.log('🛑 Recording ended');
            isRecording = false;
            btnVoiceInput.classList.remove('recording');
            if (voiceRecordingIndicator) {
                voiceRecordingIndicator.style.display = 'none';
            }
        };
    }

    function startRecording() {
        if (!recognition) return;

        try {
            recognition.start();
            console.log('▶️ Starting recording...');
        } catch (error) {
            console.error('Error starting recognition:', error);

            // If already started, just continue
            if (error.message.includes('already started')) {
                console.log('Recognition already active');
            }
        }
    }

    function stopRecording() {
        if (!recognition || !isRecording) return;

        try {
            recognition.stop();
            console.log('⏹️ Stopping recording...');
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }

    // ============================================
    // FILE UPLOAD FUNCTIONS
    // ============================================
    function initFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const btnSelectFiles = document.getElementById('btnSelectFiles');
        const filePreviewContainer = document.getElementById('filePreviewContainer');

        if (!uploadArea || !fileInput || !btnSelectFiles) {
            console.error('File upload elements not found');
            return;
        }

        // Button click to trigger file input
        btnSelectFiles.addEventListener('click', function(e) {
            e.stopPropagation();
            fileInput.click();
        });

        // Upload area click
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', function(e) {
            handleFileSelect(e.target.files);
        });

        // Drag & Drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');

            const files = e.dataTransfer.files;
            handleFileSelect(files);
        });
    }

    function handleFileSelect(files) {
        const fileArray = Array.from(files);

        // Check if adding these files exceeds max limit
        if (uploadedFiles.length + fileArray.length > MAX_FILES) {
            alert(`❌ Maksimal ${MAX_FILES} file. Anda sudah mengunggah ${uploadedFiles.length} file.`);
            return;
        }

        // Process each file
        fileArray.forEach(file => {
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert(`❌ File "${file.name}" ditolak. Format harus JPG, PNG, MP4, atau MOV.`);
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                alert(`❌ File "${file.name}" terlalu besar (${sizeMB}MB). Maksimal 10MB per file.`);
                return;
            }

            // Check for duplicates
            const isDuplicate = uploadedFiles.some(f => f.name === file.name && f.size === file.size);
            if (isDuplicate) {
                alert(`❌ File "${file.name}" sudah diunggah.`);
                return;
            }

            // Add to uploaded files
            uploadedFiles.push(file);
            formData.buktiFiles = uploadedFiles; // Store in formData

            // Create preview
            createFilePreview(file);
        });

        // Update validation
        validateStep4();

        // Clear input value to allow re-uploading same file
        document.getElementById('fileInput').value = '';
    }

    function createFilePreview(file) {
        const filePreviewContainer = document.getElementById('filePreviewContainer');
        const reader = new FileReader();

        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            previewItem.dataset.fileName = file.name;

            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
            const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

            let mediaHTML = '';
            if (isImage) {
                mediaHTML = `<img src="${e.target.result}" alt="${file.name}" class="file-preview-image">`;
            } else if (isVideo) {
                mediaHTML = `
                    <video src="${e.target.result}" class="file-preview-video"></video>
                    <div class="file-preview-video-icon">
                        <i class="fas fa-play-circle"></i>
                    </div>
                `;
            }

            const fileSizeKB = (file.size / 1024).toFixed(1);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const displaySize = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

            previewItem.innerHTML = `
                ${mediaHTML}
                <div class="file-preview-info">
                    <div class="file-preview-name" title="${file.name}">${file.name}</div>
                    <div class="file-preview-size">${displaySize}</div>
                </div>
                <button type="button" class="file-preview-remove" title="Hapus file">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Add remove button event
            const removeBtn = previewItem.querySelector('.file-preview-remove');
            removeBtn.addEventListener('click', function() {
                removeFile(file.name);
            });

            filePreviewContainer.appendChild(previewItem);

            // Show file count indicator
            updateFileCountIndicator();
        };

        reader.readAsDataURL(file);
    }

    function removeFile(fileName) {
        // Remove from uploadedFiles array
        const index = uploadedFiles.findIndex(f => f.name === fileName);
        if (index > -1) {
            uploadedFiles.splice(index, 1);
            formData.buktiFiles = uploadedFiles;
        }

        // Remove preview element
        const filePreviewContainer = document.getElementById('filePreviewContainer');
        const previewItem = filePreviewContainer.querySelector(`[data-file-name="${fileName}"]`);
        if (previewItem) {
            previewItem.style.opacity = '0';
            previewItem.style.transform = 'scale(0.8)';
            setTimeout(() => {
                previewItem.remove();
                updateFileCountIndicator();
            }, 300);
        }

        // Revalidate
        validateStep4();
    }

    function updateFileCountIndicator() {
        const filePreviewContainer = document.getElementById('filePreviewContainer');

        // Remove existing indicator
        const existingIndicator = filePreviewContainer.querySelector('.file-count-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Add new indicator if files exist
        if (uploadedFiles.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'file-count-indicator';
            indicator.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${uploadedFiles.length} file diunggah (Max ${MAX_FILES})</span>
            `;
            filePreviewContainer.appendChild(indicator);
        }
    }

    // ============================================
    // FORM SUBMISSION - Backend API Integration
    // ============================================
    async function submitForm() {
        console.log('=== FORM SUBMISSION ===');
        console.log('Final Form Data:', formData);
        console.log('Uploaded Files:', uploadedFiles);

        // Show loading state
        const btnKirimPengaduan = document.getElementById('btnKirimPengaduan');
        const originalText = btnKirimPengaduan.innerHTML;
        btnKirimPengaduan.disabled = true;
        btnKirimPengaduan.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

        try {
            // Build FormData for multipart/form-data upload
            const formDataToSend = new FormData();

            // Add text fields (using frontend naming convention - backend will map)
            formDataToSend.append('nama', formData.namaKorban || 'Anonim'); // Optional, default to Anonim
            formDataToSend.append('emailKorban', formData.emailKorban || '');
            formDataToSend.append('genderKorban', formData.genderKorban || '');
            formDataToSend.append('usiaKorban', formData.usiaKorban || '');
            formDataToSend.append('whatsappKorban', formData.whatsappKorban || '');
            formDataToSend.append('waktuKejadian', formData.waktuKejadian || '');
            formDataToSend.append('lokasiKejadian', formData.lokasiKejadian || '');
            formDataToSend.append('detailKejadian', formData.detailKejadian || '');
            formDataToSend.append('kategori', 'Lainnya'); // Default category
            formDataToSend.append('kehawatiran', formData.kehawatiran || 'sedikit');
            formDataToSend.append('source', 'manual');

            // Add additional fields
            if (formData.pelakuKekerasan) {
                formDataToSend.append('pelaku', formData.pelakuKekerasan);
            }

            if (formData.korban) {
                formDataToSend.append('status_korban', formData.korban);
            }

            // Add disabilitas info if provided
            if (formData.disabilitasStatus === 'ya' && formData.jenisDisabilitas) {
                formDataToSend.append('jenis_pelanggaran', formData.jenisDisabilitas);
            }

            // Add multiple files (IMPORTANT: use 'bukti_files[]' for array)
            if (uploadedFiles.length > 0) {
                uploadedFiles.forEach((file) => {
                    formDataToSend.append('bukti_files[]', file, file.name);
                });
                console.log(`✅ Adding ${uploadedFiles.length} files to upload`);
            }

            // Debug: Log what we're sending
            console.log('📤 Sending report to backend...');
            console.log('Fields being sent:');
            for (let pair of formDataToSend.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`  ${pair[0]}: [File] ${pair[1].name} (${(pair[1].size / 1024 / 1024).toFixed(2)}MB)`);
                } else {
                    console.log(`  ${pair[0]}: ${pair[1]}`);
                }
            }

            // Send to backend API
            const result = await apiClient.postFormData(
                APP_CONFIG.API.ENDPOINTS.REPORTS,
                formDataToSend
            );

            if (result.success) {
                // SUCCESS! 🎉
                console.log('✅ Report submitted successfully!');
                console.log('Report data:', result.data);

                const reportId = result.data.id_pelapor || result.data.id;

                // Show success message with REAL report ID from server
                alert(`✅ Pengaduan Berhasil Dikirim!\n\nKode Laporan: ${reportId}\n\nSimpan kode ini untuk melihat progress laporan Anda di menu Monitoring.`);

                // Optional: Save to localStorage as backup
                try {
                    const existingReports = JSON.parse(localStorage.getItem('laporFormData')) || [];
                    existingReports.push({
                        reportId: reportId,
                        submittedAt: new Date().toISOString(),
                        status: 'submitted',
                        kategori: formData.kategori || 'Lainnya'
                    });
                    localStorage.setItem('laporFormData', JSON.stringify(existingReports));
                    console.log('✅ Report ID saved to localStorage');
                } catch (e) {
                    console.warn('Failed to save to localStorage:', e);
                }

                // Redirect to monitoring page with report ID
                setTimeout(() => {
                    window.location.href = `../Monitoring/monitoring.html?id=${reportId}`;
                }, 2000);

            } else {
                // FAILED - show error
                console.error('❌ Failed to submit report:', result.error);

                let errorMessage = 'Gagal mengirim pengaduan. ';

                if (result.status === 422) {
                    // Validation errors
                    errorMessage += 'Periksa kembali data yang Anda isi:\n';
                    if (result.details) {
                        Object.keys(result.details).forEach(field => {
                            const fieldErrors = result.details[field];
                            const errorText = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
                            errorMessage += `\n• ${errorText}`;
                        });
                    }
                } else if (result.status === 401) {
                    errorMessage += 'Sesi Anda telah berakhir. Silakan login kembali.';
                    setTimeout(() => {
                        window.location.href = '../auth/login.html';
                    }, 2000);
                    return;
                } else {
                    errorMessage += result.message || 'Terjadi kesalahan. Silakan coba lagi.';
                }

                alert('❌ ' + errorMessage);

                // Reset button
                btnKirimPengaduan.disabled = false;
                btnKirimPengaduan.innerHTML = originalText;
            }

        } catch (error) {
            // EXCEPTION - network error, etc
            console.error('❌ Exception during submission:', error);

            alert('❌ Terjadi kesalahan:\n' + error.message + '\n\nPastikan koneksi internet Anda stabil dan backend server berjalan.');

            // Reset button
            btnKirimPengaduan.disabled = false;
            btnKirimPengaduan.innerHTML = originalText;
        }
    }

    function generateReportCode() {
        const prefix = 'PPKS';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return prefix + timestamp + random;
    }

    function saveToLocalStorage() {
        try {
            const existingReports = JSON.parse(localStorage.getItem('laporFormData')) || [];
            existingReports.push(formData);
            localStorage.setItem('laporFormData', JSON.stringify(existingReports));
            console.log('✅ Form data saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }

    // ============================================
    // INITIALIZE ON DOM READY
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();