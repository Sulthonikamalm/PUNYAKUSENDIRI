<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    /**
     * Table name
     */
    protected $table = 'reports';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'id_pelapor',
        'source',
        'nama',
        'jenis_kelamin',
        'email',
        'usia_korban',        // NEW: Victim age
        'whatsapp_korban',    // NEW: Victim WhatsApp
        'tanggal_kejadian',
        'hari_kejadian',
        'lokasi_kejadian',
        'lokasi',
        'kronologi',
        'deskripsi',
        'kategori',
        'jenis_pelanggaran',
        'status',
        'status_pelanggaran',
        'tingkat_khawatir',
        'resume_laporan',
        'catatan_admin',
        'bukti_file_path',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'tanggal_kejadian' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot method - generate ID Pelapor automatically
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($report) {
            if (empty($report->id_pelapor)) {
                // Generate ID format: #876364 (random 6 digit)
                $report->id_pelapor = '#' . rand(100000, 999999);
            }
        });
    }

    /**
     * Scope queries by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope queries by kategori
     */
    public function scopeByKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    /**
     * Scope queries for recent reports
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope queries by status_pelanggaran
     */
    public function scopeByStatusPelanggaran($query, $statusPelanggaran)
    {
        return $query->where('status_pelanggaran', $statusPelanggaran);
    }

    /**
     * Report belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Report has many files (multi-file upload)
     */
    public function files()
    {
        return $this->hasMany(ReportFile::class);
    }
}
