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

    // Generate particles
    generateParticles();

    // Check URL parameter
    checkURLParameter();

    // Setup event listeners
    setupEventListeners();

    console.log('✅ Monitoring System Ready');
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
      // TODO: Ganti URL ini dengan endpoint Laravel API Anda
      const API_ENDPOINT = `/api/reports/${reportId}`;

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add authentication header jika diperlukan:
          // 'Authorization': 'Bearer ' + yourAuthToken
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Report not found:', reportId);
          return null;
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Expected Laravel API response format:
      // {
      //   "success": true,
      //   "data": {
      //     "id": "GNJ34",
      //     "status": "completed", // or "in_progress"
      //     "reporterName": "Anonymous",
      //     "createdAt": "2025-01-15T14:30:00",
      //     "steps": [
      //       {
      //         "id": 1,
      //         "title": "Form telah ditemukan",
      //         "description": "...",
      //         "status": "success", // "success" | "loading" | "failed"
      //         "delay": 4000,
      //         "icon": "✓"
      //       },
      //       {
      //         "id": 2,
      //         "title": "Pengiriman identitas korban",
      //         "description": "...",
      //         "status": "loading", // This is the CURRENT step
      //         "delay": 999999,
      //         "icon": "⏸"
      //       }
      //       // NOTE: Last step in array = current progress
      //     ]
      //   }
      // }

      return data.success ? data.data : null;

    } catch (error) {
      console.error('❌ Error fetching report:', error);

      // Show user-friendly error
      showError('Terjadi kesalahan saat mengambil data. Pastikan server Laravel berjalan.');
      return null;
    }
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
