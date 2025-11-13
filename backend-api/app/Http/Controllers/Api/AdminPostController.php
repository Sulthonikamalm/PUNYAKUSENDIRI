<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPostController extends Controller
{
    /**
     * Display all posts (including drafts) for admin
     * GET /api/admin/posts
     */
    public function index(Request $request)
    {
        $query = Post::with('user');

        // Filter by is_published
        if ($request->has('is_published')) {
            $query->where('is_published', $request->is_published);
        }

        // Search by judul or konten
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhere('konten', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $posts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Posts retrieved successfully',
            'data' => $posts
        ], 200);
    }

    /**
     * Store a newly created post (admin only)
     * POST /api/admin/posts
     */
    public function store(StorePostRequest $request)
    {
        try {
            $data = $request->except('thumbnail');

            // Add authenticated admin user_id
            $data['user_id'] = auth()->id();

            // Handle thumbnail upload - CRITICAL SECURITY
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');

                // Store file in public disk (storage/app/public/thumbnails)
                $path = $file->store('thumbnails', 'public');

                $data['thumbnail_path'] = $path;
            }

            // Create post
            $post = Post::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Post created successfully',
                'data' => $post
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified post (admin)
     * GET /api/admin/posts/{id}
     */
    public function show(string $id)
    {
        $post = Post::with('user')->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Post retrieved successfully',
            'data' => $post
        ], 200);
    }

    /**
     * Update the specified post (admin only)
     * PUT/PATCH /api/admin/posts/{id}
     */
    public function update(UpdatePostRequest $request, string $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        try {
            $data = $request->except('thumbnail');

            // Handle thumbnail upload - CRITICAL SECURITY
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if exists
                if ($post->thumbnail_path) {
                    Storage::disk('public')->delete($post->thumbnail_path);
                }

                $file = $request->file('thumbnail');

                // Store new file
                $path = $file->store('thumbnails', 'public');

                $data['thumbnail_path'] = $path;
            }

            // Update post
            $post->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Post updated successfully',
                'data' => $post->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified post (admin only)
     * DELETE /api/admin/posts/{id}
     */
    public function destroy(string $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        try {
            // Delete thumbnail if exists
            if ($post->thumbnail_path) {
                Storage::disk('public')->delete($post->thumbnail_path);
            }

            $post->delete();

            return response()->json([
                'success' => true,
                'message' => 'Post deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish or unpublish a post (admin only)
     * PATCH /api/admin/posts/{id}/publish
     */
    public function togglePublish(string $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        try {
            $post->is_published = !$post->is_published;
            $post->save();

            return response()->json([
                'success' => true,
                'message' => $post->is_published ? 'Post published successfully' : 'Post unpublished successfully',
                'data' => $post
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle publish status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
