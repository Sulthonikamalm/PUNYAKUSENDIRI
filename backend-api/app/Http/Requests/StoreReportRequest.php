<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check(); // User must be authenticated
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Original fields (backward compatible)
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

            // New fields as per master prompt
            'jenis_pelanggaran' => 'sometimes|string|max:255',
            'deskripsi' => 'sometimes|string',
            'lokasi' => 'sometimes|string|max:255',

            // File upload validation - CRITICAL
            'bukti_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120', // Max 5MB
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama wajib diisi',
            'tanggal_kejadian.required' => 'Tanggal kejadian wajib diisi',
            'tanggal_kejadian.date' => 'Format tanggal tidak valid',
            'lokasi_kejadian.required' => 'Lokasi kejadian wajib diisi',
            'kronologi.required' => 'Kronologi kejadian wajib diisi',
            'kategori.required' => 'Kategori laporan wajib dipilih',
            'kategori.in' => 'Kategori tidak valid',
            'bukti_file.mimes' => 'File harus berformat: jpg, jpeg, png, pdf, doc, docx',
            'bukti_file.max' => 'Ukuran file maksimal 5MB',
        ];
    }
}
