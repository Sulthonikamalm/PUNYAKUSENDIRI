<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReportStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only admin can update report status
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Status can be either old format or new format
            'status' => 'sometimes|in:pending,process,complete',
            'status_pelanggaran' => 'sometimes|in:menunggu,diproses,selesai',
            'catatan_admin' => 'sometimes|string|max:1000',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'status.in' => 'Status harus: pending, process, atau complete',
            'status_pelanggaran.in' => 'Status pelanggaran harus: menunggu, diproses, atau selesai',
            'catatan_admin.max' => 'Catatan admin maksimal 1000 karakter',
        ];
    }

    /**
     * Handle failed authorization
     */
    protected function failedAuthorization()
    {
        throw new \Illuminate\Auth\Access\AuthorizationException(
            'Hanya admin yang dapat mengupdate status laporan'
        );
    }
}
