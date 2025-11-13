<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/reports
     */
    public function index(Request $request)
    {
        $query = Report::query();

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by kategori
        if ($request->has('kategori')) {
            $query->byKategori($request->kategori);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('tanggal_kejadian', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('tanggal_kejadian', '<=', $request->end_date);
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
     * Store a newly created resource in storage.
     * POST /api/reports
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'source' => 'sometimes|in:chatbot_guided,chatbot_curhat,manual',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'email' => 'nullable|email|max:255',
            'tanggal_kejadian' => 'required|date',
            'hari_kejadian' => 'nullable|string',
            'lokasi_kejadian' => 'required|string',
            'kronologi' => 'required|string',
            'kategori' => 'required|in:Pelecehan Seksual,Kekerasan Fisik,Kekerasan Psikis,Perundungan,Lainnya',
            'tingkat_khawatir' => 'nullable|in:sedikit,khawatir,sangat',
            'resume_laporan' => 'nullable|string',
            'jenis_pelanggaran' => 'sometimes|string|max:255',
            'deskripsi' => 'sometimes|string',
            'lokasi' => 'sometimes|string|max:255',
            'bukti_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->except('bukti_file');

            // Add user_id from authenticated user
            if (auth()->check()) {
                $data['user_id'] = auth()->id();
            }

            // Handle file upload - CRITICAL SECURITY
            if ($request->hasFile('bukti_file')) {
                $file = $request->file('bukti_file');

                // Store file in public disk (storage/app/public/bukti)
                $path = $file->store('bukti', 'public');

                $data['bukti_file_path'] = $path;
            }

            // Create report
            $report = Report::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'data' => $report
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/reports/{id}
     */
    public function show(string $id)
    {
        $report = Report::find($id);

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
     * Update the specified resource in storage.
     * PUT/PATCH /api/reports/{id}
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

        // Validation
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,process,complete',
            'tingkat_khawatir' => 'sometimes|in:sedikit,khawatir,sangat',
            'catatan_admin' => 'sometimes|string',
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $report->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully',
                'data' => $report
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
     * Remove the specified resource from storage.
     * DELETE /api/reports/{id}
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
     * Get statistics for dashboard
     * GET /api/reports/stats
     */
    public function stats()
    {
        $stats = [
            'total' => Report::count(),
            'pending' => Report::byStatus('pending')->count(),
            'process' => Report::byStatus('process')->count(),
            'complete' => Report::byStatus('complete')->count(),
            'recent_30_days' => Report::recent(30)->count(),
            'by_kategori' => Report::selectRaw('kategori, COUNT(*) as count')
                ->groupBy('kategori')
                ->get(),
            'by_tingkat_khawatir' => Report::selectRaw('tingkat_khawatir, COUNT(*) as count')
                ->groupBy('tingkat_khawatir')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Statistics retrieved successfully',
            'data' => $stats
        ], 200);
    }
}
