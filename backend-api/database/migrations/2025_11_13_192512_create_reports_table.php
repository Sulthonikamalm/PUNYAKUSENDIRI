<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('id_pelapor')->unique(); // Format: #876364
            $table->enum('source', ['chatbot_guided', 'chatbot_curhat', 'manual'])->default('chatbot_guided');

            // Data Pelapor
            $table->string('nama');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable();
            $table->string('email')->nullable();

            // Data Kejadian
            $table->date('tanggal_kejadian');
            $table->string('hari_kejadian')->nullable(); // Jumat, Sabtu, etc
            $table->text('lokasi_kejadian');
            $table->text('kronologi');
            $table->enum('kategori', [
                'Pelecehan Seksual',
                'Kekerasan Fisik',
                'Kekerasan Psikis',
                'Perundungan',
                'Lainnya'
            ]);

            // Status & Metadata
            $table->enum('status', ['pending', 'process', 'complete'])->default('pending');
            $table->enum('tingkat_khawatir', ['sedikit', 'khawatir', 'sangat'])->default('khawatir');
            $table->text('resume_laporan')->nullable();
            $table->text('catatan_admin')->nullable(); // Admin notes

            $table->timestamps();

            // Indexes untuk performa query
            $table->index('status');
            $table->index('kategori');
            $table->index('tanggal_kejadian');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
