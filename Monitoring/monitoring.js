// ============================================
// MONITORING.JS - Simplified Version
// Version: 3.0.0
// Shows only CURRENT/LAST step with centered cube loading
// ============================================

(function() {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const State = {
    currentReport: null,
    isSearching: false
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const DOM = {
    reportIdInput: document.getElementById('reportIdInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchLoader: document.getElementById('searchLoader'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    timelineContainer: document.getElementById('timelineContainer'),
    timelineHeader: document.getElementById('timelineHeader'),
    timelineTitle: document.getElementById('timelineTitle'),
    timelineId: document.getElementById('timelineId'),
    timelineDate: document.getElementById('timelineDate'),
    statusBadge: document.getElementById('statusBadge'),
    statusText: document.getElementById('statusText'),
    timeline: document.getElementById('timeline'),
    particlesBg: document.getElementById('particlesBg'),
    centeredLoadingOverlay: document.getElementById('centeredLoadingOverlay')
  };

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    searchDelay: 1200,           // ms to simulate API call
    centeredCubeDelay: 1500      // ms to show centered cube
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    console.log('🚀 Monitoring System v3.0 Initializing...');

    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
      // Show warning message (don't block access yet)
      console.warn('⚠️ User not authenticated - may not be able to fetch reports');

      // Show UI message
      showAuthWarning();
    } else {
      console.log('✅ User authenticated:', authManager.getCurrentUser().name);
    }

    // Generate particles
    generateParticles();

    // Check URL parameter
    checkURLParameter();

    // Setup event listeners
    setupEventListeners();

    console.log('✅ Monitoring System Ready');
  }

  // ============================================
  // SHOW AUTHENTICATION WARNING
  // ============================================
  function showAuthWarning() {
    // Create warning banner
    const warningBanner = document.createElement('div');
    warningBanner.className = 'auth-warning-banner';
    warningBanner.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 90%;
        animation: slideDown 0.5s ease;
    `;

    warningBanner.innerHTML = `
        <i class="fas fa-info-circle" style="font-size: 24px;"></i>
        <div>
            <strong>Info:</strong> Untuk melacak laporan, silakan login terlebih dahulu.
        </div>
        <button onclick="window.location.href='../auth/login.html'"
                style="background: white; color: #667eea; border: none;
                       padding: 8px 20px; border-radius: 8px; cursor: pointer;
                       font-weight: 600; transition: all 0.3s;">
            Login
        </button>
        <button onclick="this.parentElement.remove()"
                style="background: transparent; color: white; border: none;
                       padding: 8px; cursor: pointer; font-size: 20px;">
            ×
        </button>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(warningBanner);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      warningBanner.style.opacity = '0';
      warningBanner.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => warningBanner.remove(), 500);
    }, 8000);
  }

  // ============================================
  // GENERATE PARTICLES
  // ============================================
  function generateParticles() {
    const particlesContainer = DOM.particlesBg?.querySelector('.bottom-particles');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth > 768 ? 50 : 30;

    for (let i = 0; i < particleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      particlesContainer.appendChild(bubble);
    }

    console.log(`🎈 Generated ${particleCount} particles`);
  }

  // ============================================
  // SETUP EVENT LISTENERS
  // ============================================
  function setupEventListeners() {
    // Search button
    if (DOM.searchBtn) {
      DOM.searchBtn.addEventListener('click', handleSearch);
    }

    // Enter key in input
    if (DOM.reportIdInput) {
      DOM.reportIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearch();
        }
      });

      // Clear error on input
      DOM.reportIdInput.addEventListener('input', () => {
        hideError();
        DOM.reportIdInput.value = DOM.reportIdInput.value.toUpperCase();
      });
    }
  }

  // ============================================
  // CHECK URL PARAMETER
  // Auto-search if ?id=xxx from landing page
  // ============================================
  function checkURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
      console.log('🔍 Auto-search triggered:', reportId);
      DOM.reportIdInput.value = reportId.toUpperCase();

      setTimeout(() => {
        handleSearch();
      }, 1000);
    }
  }

  // ============================================
  // HANDLE SEARCH
  // ============================================
  async function handleSearch() {
    // Prevent multiple searches
    if (State.isSearching) {
      console.log('⏳ Already processing...');
      return;
    }

    const reportId = DOM.reportIdInput.value.trim().toUpperCase();

    // Validation
    if (!reportId) {
      showError('Silakan masukkan ID Laporan.');
      return;
    }

    console.log('🔎 Searching for report:', reportId);

    // UI: Show loading
    State.isSearching = true;
    disableInput();
    hideError();
    showSearchLoader();

    // Fetch report from Laravel API (async)
    const report = await getReportById(reportId);

    hideSearchLoader();

    if (!report) {
      // Not found
      console.log('❌ Report not found:', reportId);
      showError(`ID Laporan "${reportId}" tidak ditemukan. Silakan periksa kembali.`);
      enableInput();
      State.isSearching = false;
      return;
    }

    // Found!
    console.log('✅ Report found:', report);
    State.currentReport = report;

    // Update timeline header
    updateTimelineHeader();

    // Clear timeline and show centered cube loading
    clearTimeline();
    showCenteredLoading();

    // After delay, show the current/last step
    setTimeout(() => {
      hideCenteredLoading();
      displayCurrentStep();
      State.isSearching = false;
      enableInput();

      // Show confetti if completed
      checkCompletionConfetti();
    }, CONFIG.centeredCubeDelay);
  }

  // ============================================
  // UPDATE TIMELINE HEADER
  // ============================================
  function updateTimelineHeader() {
    if (!State.currentReport) return;

    // Show header
    DOM.timelineHeader.style.display = 'flex';
    DOM.timelineHeader.style.opacity = '0';
    DOM.timelineHeader.style.transform = 'translateY(-12px)';

    // Update content
    DOM.timelineTitle.textContent = `Progress Laporan`;
    DOM.timelineId.textContent = State.currentReport.id;

    // Format date
    const date = new Date(State.currentReport.createdAt);
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    DOM.timelineDate.textContent = formattedDate;

    // Status badge
    const isCompleted = State.currentReport.status === 'completed';
    DOM.statusBadge.className = `timeline-status-badge ${isCompleted ? 'status-completed' : ''}`;
    DOM.statusBadge.innerHTML = `
      <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-clock'}"></i>
      <span id="statusText">${isCompleted ? 'Selesai' : 'Dalam Proses'}</span>
    `;

    // Animate in
    requestAnimationFrame(() => {
      DOM.timelineHeader.style.transition = 'all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
      DOM.timelineHeader.style.opacity = '1';
      DOM.timelineHeader.style.transform = 'translateY(0)';
    });
  }

  // ============================================
  // CLEAR TIMELINE
  // ============================================
  function clearTimeline() {
    DOM.timeline.style.opacity = '0';

    setTimeout(() => {
      DOM.timeline.innerHTML = '';
      DOM.timeline.style.transition = 'opacity 0.4s ease';
      DOM.timeline.style.opacity = '1';
    }, 300);
  }

  // ============================================
  // SHOW CENTERED LOADING
  // ============================================
  function showCenteredLoading() {
    if (DOM.centeredLoadingOverlay) {
      DOM.centeredLoadingOverlay.style.display = 'flex';
      DOM.centeredLoadingOverlay.style.opacity = '0';

      requestAnimationFrame(() => {
        DOM.centeredLoadingOverlay.style.transition = 'opacity 0.4s ease';
        DOM.centeredLoadingOverlay.style.opacity = '1';
      });
    }
  }

  // ============================================
  // HIDE CENTERED LOADING
  // ============================================
  function hideCenteredLoading() {
    if (DOM.centeredLoadingOverlay) {
      DOM.centeredLoadingOverlay.style.opacity = '0';

      setTimeout(() => {
        DOM.centeredLoadingOverlay.style.display = 'none';
      }, 400);
    }
  }

  // ============================================
  // DISPLAY CURRENT/LAST STEP
  // Shows only the most recent step
  // ============================================
  function displayCurrentStep() {
    if (!State.currentReport || !State.currentReport.steps || State.currentReport.steps.length === 0) {
      console.error('❌ No steps to display');
      return;
    }

    // Get the LAST step (current progress)
    const currentStep = State.currentReport.steps[State.currentReport.steps.length - 1];
    console.log(`📍 Displaying current step:`, currentStep);

    // Create step element
    const stepElement = createStepElement(currentStep);
    DOM.timeline.innerHTML = ''; // Clear
    DOM.timeline.appendChild(stepElement);

    // Animate in
    requestAnimationFrame(() => {
      stepElement.style.opacity = '1';
      stepElement.style.transform = 'translateY(0) scale(1)';
    });
  }

  // ============================================
  // CREATE STEP ELEMENT
  // ============================================
  function createStepElement(step) {
    const stepElement = document.createElement('div');
    stepElement.className = `timeline-item status-${step.status}`;
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'translateY(24px) scale(0.95)';
    stepElement.style.transition = 'all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';

    // Marker with icon (or cube if loading)
    const marker = document.createElement('div');

    if (step.status === 'loading') {
      // Show small cube for loading state
      marker.className = 'timeline-marker marker-loading';
      marker.innerHTML = createSmallCubeHTML();
    } else if (step.status === 'success') {
      marker.className = 'timeline-marker marker-success';
      marker.innerHTML = step.icon || '✓';
    } else if (step.status === 'failed') {
      marker.className = 'timeline-marker marker-failed';
      marker.innerHTML = step.icon || '✗';
    } else {
      marker.className = 'timeline-marker marker-pending';
      marker.innerHTML = step.icon || '⏸';
    }

    // Content
    const content = document.createElement('div');
    content.className = 'timeline-content';

    const title = document.createElement('div');
    title.className = 'timeline-content-title';
    title.textContent = step.title;

    const desc = document.createElement('p');
    desc.className = 'timeline-content-desc';
    desc.textContent = step.description; // Direct text, no typing effect

    content.appendChild(title);
    content.appendChild(desc);

    stepElement.appendChild(marker);
    stepElement.appendChild(content);

    return stepElement;
  }

  // ============================================
  // CREATE SMALL CUBE HTML (for loading marker)
  // ============================================
  function createSmallCubeHTML() {
    return `
      <div class="cube-wrapper small">
        <div class="cube">
          <div class="cube-faces">
            <div class="cube-face shadow"></div>
            <div class="cube-face bottom"></div>
            <div class="cube-face top"></div>
            <div class="cube-face left"></div>
            <div class="cube-face right"></div>
            <div class="cube-face back"></div>
            <div class="cube-face front"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // CHECK COMPLETION & CONFETTI
  // ============================================
  function checkCompletionConfetti() {
    if (!State.currentReport) return;

    const allSteps = State.currentReport.steps;
    const allSuccess = allSteps.every(s => s.status === 'success');

    if (allSuccess && State.currentReport.status === 'completed') {
      setTimeout(() => {
        console.log('🎉 All steps completed! Starting confetti...');
        if (window.Confetti) {
          window.Confetti.start();
        }
      }, 800);
    }
  }

  // ============================================
  // UI HELPERS
  // ============================================
  function showSearchLoader() {
    DOM.searchLoader?.classList.add('show');
  }

  function hideSearchLoader() {
    DOM.searchLoader?.classList.remove('show');
  }

  function showError(message) {
    DOM.errorText.textContent = message;
    DOM.errorMessage.classList.add('show');
  }

  function hideError() {
    DOM.errorMessage.classList.remove('show');
  }

  function disableInput() {
    DOM.reportIdInput.disabled = true;
    DOM.searchBtn.disabled = true;
    DOM.searchBtn.classList.add('loading');
  }

  function enableInput() {
    DOM.reportIdInput.disabled = false;
    DOM.searchBtn.disabled = false;
    DOM.searchBtn.classList.remove('loading');
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch report from Laravel backend API
   * @param {string} reportId - Kode laporan
   * @returns {Promise<object|null>} Report data dari API
   */
  async function getReportById(reportId) {
    try {
      console.log('🔍 Fetching report:', reportId);

      // Check authentication first
      if (!authManager.isAuthenticated()) {
        console.warn('⚠️ User not authenticated');
        showError('Silakan login terlebih dahulu untuk melacak laporan.');

        // Show login button
        setTimeout(() => {
          if (confirm('Anda harus login untuk melihat status laporan. Login sekarang?')) {
            window.location.href = '../auth/login.html';
          }
        }, 1000);

        return null;
      }

      // Use apiClient for authenticated request
      const result = await apiClient.get(
        `${APP_CONFIG.API.ENDPOINTS.REPORTS}/${reportId}`
      );

      if (result.success) {
        console.log('✅ Report found:', result.data);

        // Transform backend data to frontend format
        return transformReportData(result.data);
      } else {
        // Handle different error types
        if (result.status === 404) {
          console.log('❌ Report not found:', reportId);
          return null;
        } else if (result.status === 401) {
          console.error('❌ Unauthorized - token invalid');
          showError('Sesi Anda telah berakhir. Silakan login kembali.');

          setTimeout(() => {
            authManager.logout();
          }, 2000);

          return null;
        } else if (result.status === 403) {
          console.error('❌ Forbidden - not your report');
          showError('Anda tidak memiliki akses ke laporan ini.');
          return null;
        } else {
          console.error('❌ API error:', result.error);
          showError(result.message || 'Gagal mengambil data laporan.');
          return null;
        }
      }

    } catch (error) {
      console.error('❌ Exception fetching report:', error);

      if (error.message && error.message.includes('Network')) {
        showError('Koneksi internet bermasalah. Periksa koneksi Anda.');
      } else {
        showError('Terjadi kesalahan saat mengambil data. Pastikan server backend berjalan.');
      }

      return null;
    }
  }

  // ============================================
  // TRANSFORM REPORT DATA
  // Convert backend format to frontend format
  // ============================================
  function transformReportData(backendData) {
    /**
     * Backend returns:
     * {
     *   "id": 123,
     *   "id_pelapor": "PPKS123456789",
     *   "nama": "John Doe",
     *   "email": "john@example.com",
     *   "status": "pending", // or "process", "complete"
     *   "status_pelanggaran": "menunggu", // or "diproses", "selesai"
     *   "kategori": "Pelecehan Seksual",
     *   "tanggal_kejadian": "2025-11-13",
     *   "created_at": "2025-11-13T10:30:00.000000Z",
     *   ...
     * }
     *
     * Frontend expects:
     * {
     *   "id": "PPKS123456789",
     *   "status": "completed", // or "in_progress"
     *   "reporterName": "Anonymous",
     *   "createdAt": "2025-11-13T10:30:00",
     *   "steps": [...]
     * }
     */

    // Map status from backend to frontend
    let frontendStatus = 'in_progress';
    if (backendData.status === 'complete' || backendData.status_pelanggaran === 'selesai') {
      frontendStatus = 'completed';
    }

    // Build steps array based on status
    const steps = buildStepsFromStatus(backendData);

    return {
      id: backendData.id_pelapor || backendData.id,
      status: frontendStatus,
      reporterName: backendData.nama || 'Anonymous',
      createdAt: backendData.created_at,
      category: backendData.kategori,
      steps: steps
    };
  }

  // ============================================
  // BUILD STEPS FROM STATUS
  // Generate timeline steps based on report status
  // ============================================
  function buildStepsFromStatus(report) {
    const steps = [];

    // Step 1: Report received (always completed if report exists)
    steps.push({
      id: 1,
      title: 'Laporan Diterima',
      description: `Laporan ${report.kategori || 'kasus'} telah berhasil diterima oleh sistem pada ${formatDate(report.created_at)}.`,
      status: 'success',
      icon: '✓'
    });

    // Step 2: Verification (based on status)
    if (report.status === 'pending') {
      // Still waiting for verification
      steps.push({
        id: 2,
        title: 'Menunggu Verifikasi',
        description: 'Laporan Anda sedang menunggu verifikasi dari tim kami. Proses ini biasanya memakan waktu 1-2 hari kerja.',
        status: 'loading',
        icon: '⏸'
      });
    } else {
      // Verification complete
      steps.push({
        id: 2,
        title: 'Verifikasi Selesai',
        description: 'Laporan Anda telah diverifikasi dan sedang dalam proses penanganan.',
        status: 'success',
        icon: '✓'
      });
    }

    // Step 3: Investigation (if status is 'process')
    if (report.status === 'process' || report.status_pelanggaran === 'diproses') {
      steps.push({
        id: 3,
        title: 'Dalam Proses Investigasi',
        description: 'Tim kami sedang melakukan investigasi dan penanganan terhadap laporan Anda. Kami akan menghubungi Anda jika memerlukan informasi tambahan.',
        status: 'loading',
        icon: '⏸'
      });
    } else if (report.status === 'complete' || report.status_pelanggaran === 'selesai') {
      steps.push({
        id: 3,
        title: 'Investigasi Selesai',
        description: 'Investigasi telah selesai dilakukan dengan menyeluruh.',
        status: 'success',
        icon: '✓'
      });
    }

    // Step 4: Completed (if status is 'complete')
    if (report.status === 'complete' || report.status_pelanggaran === 'selesai') {
      steps.push({
        id: 4,
        title: 'Kasus Selesai',
        description: report.catatan_admin || 'Penanganan kasus telah selesai. Terima kasih atas kepercayaan Anda kepada SIGAP PPKS.',
        status: 'success',
        icon: '✓'
      });
    }

    return steps;
  }

  // ============================================
  // FORMAT DATE HELPER
  // ============================================
  function formatDate(dateString) {
    if (!dateString) return 'tanggal tidak diketahui';

    const date = new Date(dateString);
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return date.toLocaleDateString('id-ID', options);
  }

  // ============================================
  // PUBLIC API (for debugging)
  // ============================================
  window.MonitoringSystem = {
    search: handleSearch,
    getState: () => ({ ...State }),
    getReport: getReportById,
    clearTimeline,
    displayCurrentStep,
    version: '3.0.0'
  };

  // ============================================
  // INITIALIZE
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
