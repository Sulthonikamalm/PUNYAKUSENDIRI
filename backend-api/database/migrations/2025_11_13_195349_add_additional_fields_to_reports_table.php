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
        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            $table->string('jenis_pelanggaran')->nullable()->after('kategori');
            $table->text('deskripsi')->nullable()->after('kronologi');
            $table->string('lokasi')->nullable()->after('lokasi_kejadian');
            $table->string('bukti_file_path')->nullable()->after('resume_laporan');

            // Update status enum values
            $table->enum('status_pelanggaran', ['menunggu', 'diproses', 'selesai'])->default('menunggu')->after('status');

            // Add index
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'jenis_pelanggaran', 'deskripsi', 'lokasi', 'bukti_file_path', 'status_pelanggaran']);
        });
    }
};
