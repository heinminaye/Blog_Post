import { CloudinaryResource } from '@/types/image';

export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const uploadImage = async (file: File): Promise<CloudinaryResource> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const result = await response.json();
    return result.data;
  }
  catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
export const deleteImage = async (publicId: string) => {
  try {
    const response = await fetch(`/api/images/cleanup/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};


export const highlightCode = (code: string, language: string) => {
  // In a real implementation, you would use a library like Prism.js or Highlight.js
  return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
};

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

