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
        $query = Report::with('files');

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
     *
     * CODEPRO GOOD: FIXED ALL 5 CRISIS
     * 1. ✅ nama field now nullable (support anonymous)
     * 2. ✅ Multi-file upload support (bukti_files array)
     * 3. ✅ File size increased to 10MB
     * 4. ✅ Added victim fields (usia_korban, whatsapp_korban)
     * 5. ✅ Field mapping (emailKorban->email, etc)
     */
    public function store(Request $request)
    {
        // VALIDATION - FIXED ALL ISSUES
        $validator = Validator::make($request->all(), [
            // CRISIS 1 FIX: nama now nullable for anonymous reports
            'nama' => 'nullable|string|max:255',

            // CRISIS 4 FIX: New victim fields
            'usiaKorban' => 'nullable|integer|min:1|max:150',
            'whatsappKorban' => 'nullable|string|max:20',

            // CRISIS 5 FIX: Support both naming conventions (frontend & backend)
            'emailKorban' => 'nullable|email|max:255',
            'email' => 'nullable|email|max:255',
            'genderKorban' => 'nullable|in:Laki-laki,Perempuan',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'waktuKejadian' => 'required|date',
            'tanggal_kejadian' => 'required|date',
            'lokasiKejadian' => 'required|string',
            'lokasi_kejadian' => 'required|string',
            'detailKejadian' => 'required|string|min:10',
            'kronologi' => 'required|string|min:10',
            'kehawatiran' => 'nullable|in:sedikit,khawatir,sangat',
            'tingkat_khawatir' => 'nullable|in:sedikit,khawatir,sangat',

            'kategori' => 'required|in:Pelecehan Seksual,Kekerasan Fisik,Kekerasan Psikis,Perundungan,Lainnya',
            'jenis_pelanggaran' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'source' => 'sometimes|in:chatbot_guided,chatbot_curhat,manual',
            'resume_laporan' => 'nullable|string',
            'hari_kejadian' => 'nullable|string',

            // CRISIS 2 & 3 FIX: Multi-file upload with 10MB limit
            'bukti_files' => 'nullable|array|max:5',
            'bukti_files.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx,mp4,mov|max:10240', // 10MB

            // Backward compatibility - single file
            'bukti_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,mp4,mov|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // CRISIS 5 FIX: Field mapping from frontend names to backend names
            $data = [
                'user_id' => auth()->check() ? auth()->id() : null,
                'source' => $request->input('source', 'manual'),

                // Support both naming conventions
                'nama' => $request->input('nama') ?: 'Anonim',
                'email' => $request->input('emailKorban') ?: $request->input('email'),
                'jenis_kelamin' => $request->input('genderKorban') ?: $request->input('jenis_kelamin'),

                // CRISIS 4 FIX: New victim fields
                'usia_korban' => $request->input('usiaKorban'),
                'whatsapp_korban' => $request->input('whatsappKorban'),

                // Date and location mapping
                'tanggal_kejadian' => $request->input('waktuKejadian') ?: $request->input('tanggal_kejadian'),
                'hari_kejadian' => $request->input('hari_kejadian'),
                'lokasi_kejadian' => $request->input('lokasiKejadian') ?: $request->input('lokasi_kejadian'),
                'lokasi' => $request->input('lokasi'),

                // Incident details mapping
                'kronologi' => $request->input('detailKejadian') ?: $request->input('kronologi'),
                'deskripsi' => $request->input('deskripsi'),
                'kategori' => $request->input('kategori'),
                'jenis_pelanggaran' => $request->input('jenis_pelanggaran'),

                // Status and concern level mapping
                'tingkat_khawatir' => $request->input('kehawatiran') ?: $request->input('tingkat_khawatir'),
                'resume_laporan' => $request->input('resume_laporan'),

                // Set default status
                'status' => 'pending',
                'status_pelanggaran' => 'menunggu',
            ];

            // Create report first
            $report = Report::create($data);

            // CRISIS 2 FIX: Handle MULTI-file upload (Ideal Solution B)
            if ($request->hasFile('bukti_files')) {
                foreach ($request->file('bukti_files') as $file) {
                    // Store file in public disk
                    $path = $file->store('bukti', 'public');

                    // Save to report_files table (one-to-many)
                    $report->files()->create([
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            // Backward compatibility - single file upload
            if ($request->hasFile('bukti_file')) {
                $file = $request->file('bukti_file');
                $path = $file->store('bukti', 'public');

                $report->files()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }

            // Load files relationship for response
            $report->load('files');

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
