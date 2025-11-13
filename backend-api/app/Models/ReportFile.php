<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportFile extends Model
{
    /**
     * Table name
     */
    protected $table = 'report_files';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'report_id',
        'file_path',
        'file_name',
        'file_mime_type',
        'file_size',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * File belongs to a report
     */
    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * Get full file URL
     */
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
