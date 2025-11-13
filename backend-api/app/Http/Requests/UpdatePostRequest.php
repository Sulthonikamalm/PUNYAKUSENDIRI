<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only admin can update posts
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
        $postId = $this->route('post'); // Get post ID from route

        return [
            'judul' => 'sometimes|string|max:255',
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('posts', 'slug')->ignore($postId)
            ],
            'konten' => 'sometimes|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048', // Max 2MB
            'is_published' => 'sometimes|boolean',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'judul.max' => 'Judul maksimal 255 karakter',
            'slug.unique' => 'Slug sudah digunakan',
            'thumbnail.image' => 'Thumbnail harus berupa gambar',
            'thumbnail.mimes' => 'Format thumbnail harus: jpg, jpeg, png, webp',
            'thumbnail.max' => 'Ukuran thumbnail maksimal 2MB',
        ];
    }

    /**
     * Handle failed authorization
     */
    protected function failedAuthorization()
    {
        throw new \Illuminate\Auth\Access\AuthorizationException(
            'Hanya admin yang dapat mengupdate post'
        );
    }
}
