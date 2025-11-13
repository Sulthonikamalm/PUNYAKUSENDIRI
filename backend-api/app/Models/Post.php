<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    /**
     * Table name
     */
    protected $table = 'posts';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'judul',
        'slug',
        'konten',
        'thumbnail_path',
        'is_published',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_published' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot method - auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->judul);

                // Ensure slug is unique
                $count = 1;
                while (static::where('slug', $post->slug)->exists()) {
                    $post->slug = Str::slug($post->judul) . '-' . $count;
                    $count++;
                }
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('judul') && empty($post->slug)) {
                $post->slug = Str::slug($post->judul);

                // Ensure slug is unique
                $count = 1;
                while (static::where('slug', $post->slug)->where('id', '!=', $post->id)->exists()) {
                    $post->slug = Str::slug($post->judul) . '-' . $count;
                    $count++;
                }
            }
        });
    }

    /**
     * Scope queries for published posts only
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope queries for draft posts
     */
    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }

    /**
     * Post belongs to a user (admin)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get post by slug
     */
    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }
}
