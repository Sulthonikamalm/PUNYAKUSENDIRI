<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Http\Requests\UpdateReportStatusRequest;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    /**
     * Display all reports for admin
     * GET /api/admin/reports
     */
    public function index(Request $request)
    {
        $query = Report::with('user');

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by status_pelanggaran
        if ($request->has('status_pelanggaran')) {
            $query->byStatusPelanggaran($request->status_pelanggaran);
        }

        // Filter by kategori
        if ($request->has('kategori')) {
            $query->byKategori($request->kategori);
        }

        // Filter by user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('tanggal_kejadian', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('tanggal_kejadian', '<=', $request->end_date);
        }

        // Search by nama or id_pelapor
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('id_pelapor', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $reports = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Reports retrieved successfully',
            'data' => $reports
        ], 200);
    }

    /**
     * Display the specified report
     * GET /api/admin/reports/{id}
     */
    public function show(string $id)
    {
        $report = Report::with('user')->find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Report retrieved successfully',
            'data' => $report
        ], 200);
    }

    /**
     * Update report status (admin only)
     * PATCH /api/admin/reports/{id}/status
     */
    public function updateStatus(UpdateReportStatusRequest $request, string $id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        try {
            $report->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Report status updated successfully',
                'data' => $report->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified report (full update for admin)
     * PUT /api/admin/reports/{id}
     */
    public function update(Request $request, string $id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        try {
            $report->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully',
                'data' => $report->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified report (admin only)
     * DELETE /api/admin/reports/{id}
     */
    public function destroy(string $id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        try {
            // Delete file if exists
            if ($report->bukti_file_path) {
                \Storage::disk('public')->delete($report->bukti_file_path);
            }

            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for admin dashboard
     * GET /api/admin/reports/statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => Report::count(),
            'pending' => Report::byStatus('pending')->count(),
            'process' => Report::byStatus('process')->count(),
            'complete' => Report::byStatus('complete')->count(),

            // New status
            'menunggu' => Report::byStatusPelanggaran('menunggu')->count(),
            'diproses' => Report::byStatusPelanggaran('diproses')->count(),
            'selesai' => Report::byStatusPelanggaran('selesai')->count(),

            'recent_30_days' => Report::recent(30)->count(),
            'by_kategori' => Report::selectRaw('kategori, COUNT(*) as count')
                ->groupBy('kategori')
                ->get(),
            'by_status' => Report::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'by_status_pelanggaran' => Report::selectRaw('status_pelanggaran, COUNT(*) as count')
                ->whereNotNull('status_pelanggaran')
                ->groupBy('status_pelanggaran')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Statistics retrieved successfully',
            'data' => $stats
        ], 200);
    }
}
