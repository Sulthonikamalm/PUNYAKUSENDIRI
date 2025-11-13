<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of PUBLISHED posts (public)
     * GET /api/posts
     */
    public function index(Request $request)
    {
        $query = Post::published()->with('user');

        // Search by judul or konten
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhere('konten', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $posts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Posts retrieved successfully',
            'data' => $posts
        ], 200);
    }

    /**
     * Display the specified post by slug (public)
     * GET /api/posts/{slug}
     */
    public function show(string $slug)
    {
        // Find by slug for SEO friendly URLs
        $post = Post::published()->with('user')->bySlug($slug)->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found or not published'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Post retrieved successfully',
            'data' => $post
        ], 200);
    }
}
