/**
 * =====================================================
 * ADMIN DASHBOARD - Main Controller
 * Fetch and display reports from backend API
 * =====================================================
 */

(function() {
    'use strict';

    // =====================================================
    // STATE MANAGEMENT
    // =====================================================
    const DashboardState = {
        reports: [],
        filteredReports: [],
        currentPage: 1,
        perPage: 15,
        totalPages: 0,
        filters: {
            search: '',
            status: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        },
        statistics: {
            total: 0,
            pending: 0,
            process: 0,
            complete: 0
        }
    };

    // =====================================================
    // DOM ELEMENTS
    // =====================================================
    const DOM = {
        caseList: document.getElementById('caseList'),
        loadingState: document.getElementById('loadingState'),
        searchInput: document.getElementById('searchInput'),
        filterStatus: document.getElementById('filterStatus'),
        sortBy: document.getElementById('sortBy'),
        btnApplyFilters: document.getElementById('btnApplyFilters'),
        paginationSection: document.getElementById('paginationSection'),
        pagination: document.getElementById('pagination'),
        paginationInfo: document.getElementById('paginationInfo'),
        statsSection: document.getElementById('statsSection'),
        statTotal: document.getElementById('statTotal'),
        statPending: document.getElementById('statPending'),
        statProcess: document.getElementById('statProcess'),
        statComplete: document.getElementById('statComplete'),
    };

    // =====================================================
    // INITIALIZATION
    // =====================================================
    async function init() {
        console.log('🚀 Admin Dashboard Initializing...');

        // Check admin authentication
        if (!authManager.requireAdmin()) {
            return; // Will auto-redirect if not admin
        }

        console.log('✅ Admin authenticated:', authManager.getCurrentUser().name);

        // Setup event listeners
        setupEventListeners();

        // Load initial data
        await loadReports();

        console.log('✅ Admin Dashboard Ready');
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================
    function setupEventListeners() {
        // Apply filters button
        if (DOM.btnApplyFilters) {
            DOM.btnApplyFilters.addEventListener('click', handleApplyFilters);
        }

        // Search on Enter key
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleApplyFilters();
                }
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                if (mainContent) {
                    mainContent.classList.toggle('expanded');
                }
            });
        }
    }

    // =====================================================
    // LOAD REPORTS FROM BACKEND
    // =====================================================
    async function loadReports() {
        try {
            showLoading();

            console.log('📡 Fetching reports from backend...');
            console.log('Filters:', DashboardState.filters);

            // Build query parameters
            const params = new URLSearchParams({
                page: DashboardState.currentPage,
                per_page: DashboardState.perPage,
                sort_by: DashboardState.filters.sortBy,
                sort_order: DashboardState.filters.sortOrder,
            });

            // Add optional filters
            if (DashboardState.filters.status) {
                params.append('status', DashboardState.filters.status);
            }

            if (DashboardState.filters.search) {
                params.append('search', DashboardState.filters.search);
            }

            // Fetch from backend
            const result = await apiClient.get(
                `${APP_CONFIG.API.ENDPOINTS.ADMIN_REPORTS}?${params.toString()}`
            );

            if (result.success) {
                console.log('✅ Reports loaded:', result.data);

                // Store reports
                DashboardState.reports = result.data.data; // Laravel pagination format
                DashboardState.currentPage = result.data.current_page;
                DashboardState.totalPages = result.data.last_page;

                // Update statistics
                updateStatistics();

                // Render reports
                renderReports();

                // Render pagination
                renderPagination();

                hideLoading();

            } else {
                console.error('❌ Failed to load reports:', result.error);
                showError(result.message || 'Gagal memuat data laporan.');
                hideLoading();
            }

        } catch (error) {
            console.error('❌ Exception loading reports:', error);
            showError('Terjadi kesalahan saat memuat data. Pastikan backend berjalan.');
            hideLoading();
        }
    }

    // =====================================================
    // RENDER REPORTS
    // =====================================================
    function renderReports() {
        if (!DOM.caseList) return;

        // Clear existing content
        DOM.caseList.innerHTML = '';

        // Check if empty
        if (DashboardState.reports.length === 0) {
            DOM.caseList.innerHTML = `
                <div class="empty-state text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <h4 class="mt-3 text-muted">Tidak Ada Laporan</h4>
                    <p class="text-muted">Belum ada laporan yang masuk atau coba ubah filter pencarian.</p>
                </div>
            `;
            return;
        }

        // Render each report
        DashboardState.reports.forEach(report => {
            const reportCard = createReportCard(report);
            DOM.caseList.appendChild(reportCard);
        });

        console.log(`✅ Rendered ${DashboardState.reports.length} reports`);
    }

    // =====================================================
    // CREATE REPORT CARD
    // =====================================================
    function createReportCard(report) {
        const card = document.createElement('a');
        card.href = `detail-kasus.html?id=${report.id}`;
        card.className = 'case-item-link';

        // Format date
        const date = new Date(report.created_at);
        const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        // Determine status class and text
        const statusMap = {
            'pending': { class: 'status-pending', text: 'Pending' },
            'process': { class: 'status-process', text: 'Process' },
            'complete': { class: 'status-complete', text: 'Complete' }
        };

        const statusInfo = statusMap[report.status] || statusMap['pending'];

        // Determine khawatir bar class
        const khawatirMap = {
            'sedikit': 'sedikit',
            'khawatir': 'khawatir',
            'sangat': 'sangat'
        };

        const khawatirClass = khawatirMap[report.tingkat_khawatir] || 'sedikit';

        // Build card HTML
        card.innerHTML = `
            <div class="case-item">
                <div class="row g-0 align-items-center w-100">
                    <div class="col-auto me-3">
                        <input class="form-check-input" type="checkbox"
                               onclick="event.stopPropagation()"
                               data-report-id="${report.id}">
                    </div>
                    <div class="col-lg-1">
                        <span class="case-id">#${report.id_pelapor || report.id}</span>
                    </div>
                    <div class="col-lg-2">
                        <div class="khawatir-bar ${khawatirClass}"></div>
                    </div>
                    <div class="col-lg-3">
                        <i class="bi bi-envelope-fill me-2 text-muted"></i>
                        ${report.email || report.nama || 'Anonim'}
                    </div>
                    <div class="col-lg-2">
                        <i class="bi bi-calendar-event-fill me-2 text-muted"></i>
                        ${formattedDate}
                    </div>
                    <div class="col-lg-2">
                        <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                    </div>
                    <div class="col-lg-1 text-end">
                        <div class="dropdown">
                            <button class="btn btn-sm btn-link text-muted"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    onclick="event.preventDefault(); event.stopPropagation();">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item" href="detail-kasus.html?id=${report.id}">
                                        <i class="bi bi-eye me-2"></i>Lihat Detail
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" onclick="event.preventDefault(); updateReportStatus(${report.id}, 'process')">
                                        <i class="bi bi-arrow-repeat me-2"></i>Proses
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" onclick="event.preventDefault(); updateReportStatus(${report.id}, 'complete')">
                                        <i class="bi bi-check-circle me-2"></i>Selesaikan
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); deleteReport(${report.id})">
                                        <i class="bi bi-trash me-2"></i>Hapus
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // =====================================================
    // UPDATE STATISTICS
    // =====================================================
    async function updateStatistics() {
        try {
            // Fetch statistics from backend
            const result = await apiClient.get(
                '/api/admin/reports/statistics/overview'
            );

            if (result.success) {
                const stats = result.data;

                DashboardState.statistics = {
                    total: stats.total || 0,
                    pending: stats.pending || 0,
                    process: stats.process || 0,
                    complete: stats.complete || 0
                };

                // Update DOM
                if (DOM.statTotal) DOM.statTotal.textContent = DashboardState.statistics.total;
                if (DOM.statPending) DOM.statPending.textContent = DashboardState.statistics.pending;
                if (DOM.statProcess) DOM.statProcess.textContent = DashboardState.statistics.process;
                if (DOM.statComplete) DOM.statComplete.textContent = DashboardState.statistics.complete;

                // Show stats section
                if (DOM.statsSection) {
                    DOM.statsSection.style.display = 'block';
                }

                console.log('✅ Statistics updated:', DashboardState.statistics);
            }

        } catch (error) {
            console.warn('⚠️ Failed to load statistics:', error);
            // Don't show error to user - statistics are optional
        }
    }

    // =====================================================
    // RENDER PAGINATION
    // =====================================================
    function renderPagination() {
        if (!DOM.pagination || DashboardState.totalPages <= 1) {
            if (DOM.paginationSection) {
                DOM.paginationSection.style.display = 'none';
            }
            return;
        }

        // Show pagination section
        if (DOM.paginationSection) {
            DOM.paginationSection.style.display = 'block';
        }

        // Clear existing pagination
        DOM.pagination.innerHTML = '';

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${DashboardState.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${DashboardState.currentPage - 1})">
                <i class="bi bi-chevron-left"></i>
            </a>
        `;
        DOM.pagination.appendChild(prevLi);

        // Page numbers (show max 5 pages)
        const maxPages = 5;
        let startPage = Math.max(1, DashboardState.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(DashboardState.totalPages, startPage + maxPages - 1);

        // Adjust start if we're near the end
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        // First page + ellipsis if needed
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); changePage(1)">1</a>`;
            DOM.pagination.appendChild(firstLi);

            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
                DOM.pagination.appendChild(ellipsisLi);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === DashboardState.currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `
                <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${i})">
                    ${i}
                </a>
            `;
            DOM.pagination.appendChild(pageLi);
        }

        // Last page + ellipsis if needed
        if (endPage < DashboardState.totalPages) {
            if (endPage < DashboardState.totalPages - 1) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
                DOM.pagination.appendChild(ellipsisLi);
            }

            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `
                <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${DashboardState.totalPages})">
                    ${DashboardState.totalPages}
                </a>
            `;
            DOM.pagination.appendChild(lastLi);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${DashboardState.currentPage === DashboardState.totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${DashboardState.currentPage + 1})">
                <i class="bi bi-chevron-right"></i>
            </a>
        `;
        DOM.pagination.appendChild(nextLi);

        // Update pagination info
        const totalReports = DashboardState.totalPages * DashboardState.perPage;
        const startIndex = (DashboardState.currentPage - 1) * DashboardState.perPage + 1;
        const endIndex = Math.min(DashboardState.currentPage * DashboardState.perPage, totalReports);

        if (DOM.paginationInfo) {
            DOM.paginationInfo.textContent = `Menampilkan ${startIndex}-${endIndex} dari ${totalReports} laporan`;
        }
    }

    // =====================================================
    // HANDLE FILTER CHANGES
    // =====================================================
    function handleApplyFilters() {
        // Get filter values
        DashboardState.filters.search = DOM.searchInput?.value.trim() || '';
        DashboardState.filters.status = DOM.filterStatus?.value || '';
        DashboardState.filters.sortBy = DOM.sortBy?.value || 'created_at';

        // Reset to page 1 when filters change
        DashboardState.currentPage = 1;

        console.log('🔍 Applying filters:', DashboardState.filters);

        // Reload reports
        loadReports();
    }

    // =====================================================
    // CHANGE PAGE
    // =====================================================
    window.changePage = function(page) {
        if (page < 1 || page > DashboardState.totalPages) return;
        if (page === DashboardState.currentPage) return;

        DashboardState.currentPage = page;
        loadReports();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // =====================================================
    // UPDATE REPORT STATUS
    // =====================================================
    window.updateReportStatus = async function(reportId, newStatus) {
        if (!confirm(`Ubah status laporan menjadi "${newStatus}"?`)) {
            return;
        }

        try {
            console.log(`📝 Updating report ${reportId} status to ${newStatus}...`);

            const result = await apiClient.patch(
                APP_CONFIG.API.ENDPOINTS.ADMIN_REPORT_UPDATE_STATUS.replace('{id}', reportId),
                {
                    status: newStatus
                }
            );

            if (result.success) {
                console.log('✅ Status updated successfully');
                alert('✅ Status berhasil diperbarui!');

                // Reload reports
                loadReports();
            } else {
                console.error('❌ Failed to update status:', result.error);
                alert('❌ Gagal memperbarui status: ' + (result.message || result.error));
            }

        } catch (error) {
            console.error('❌ Exception updating status:', error);
            alert('❌ Terjadi kesalahan saat memperbarui status.');
        }
    };

    // =====================================================
    // DELETE REPORT
    // =====================================================
    window.deleteReport = async function(reportId) {
        if (!confirm('⚠️ PERINGATAN: Hapus laporan ini?\n\nTindakan ini tidak dapat dibatalkan!')) {
            return;
        }

        try {
            console.log(`🗑️ Deleting report ${reportId}...`);

            const result = await apiClient.delete(
                `${APP_CONFIG.API.ENDPOINTS.ADMIN_REPORTS}/${reportId}`
            );

            if (result.success) {
                console.log('✅ Report deleted successfully');
                alert('✅ Laporan berhasil dihapus!');

                // Reload reports
                loadReports();
            } else {
                console.error('❌ Failed to delete report:', result.error);
                alert('❌ Gagal menghapus laporan: ' + (result.message || result.error));
            }

        } catch (error) {
            console.error('❌ Exception deleting report:', error);
            alert('❌ Terjadi kesalahan saat menghapus laporan.');
        }
    };

    // =====================================================
    // LOADING STATES
    // =====================================================
    function showLoading() {
        if (DOM.loadingState) {
            DOM.loadingState.style.display = 'block';
        }
        if (DOM.caseList) {
            // Hide other content
            const items = DOM.caseList.querySelectorAll('.case-item-link, .empty-state');
            items.forEach(item => item.style.display = 'none');
        }
    }

    function hideLoading() {
        if (DOM.loadingState) {
            DOM.loadingState.style.display = 'none';
        }
    }

    // =====================================================
    // ERROR HANDLING
    // =====================================================
    function showError(message) {
        if (DOM.caseList) {
            DOM.caseList.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Error:</strong> ${message}
                </div>
            `;
        }
    }

    // =====================================================
    // INITIALIZE ON DOM READY
    // =====================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
