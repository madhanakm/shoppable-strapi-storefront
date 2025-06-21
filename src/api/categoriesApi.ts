import { getCategoriesOnly } from '@/services/categoryApi';

/**
 * API endpoint handler for categories
 * This can be used with fetch('/api/categories')
 */
export async function handleCategoriesRequest(req: Request): Promise<Response> {
  try {
    const categories = await getCategoriesOnly();
    return new Response(JSON.stringify(categories), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in categories API:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}