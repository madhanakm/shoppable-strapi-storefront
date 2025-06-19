# Strapi API Integration Guide

This document provides instructions on how to set up and use the Strapi API integration with this React storefront project.

## Setup Instructions

### 1. Strapi Backend Setup

First, you need to have a Strapi backend running. If you don't have one yet, follow these steps:

1. Create a new Strapi project:
   ```bash
   npx create-strapi-app@latest my-strapi-backend --quickstart
   ```

2. Once Strapi is running, create the following content types:

   **Product**
   - name (Text)
   - description (Rich Text)
   - price (Number)
   - originalPrice (Number, optional)
   - rating (Number, optional)
   - reviews (Number, optional)
   - category (Text)
   - badge (Text, optional)
   - image (Media, single)
   - featured (Boolean)

   **Category**
   - name (Text)
   - slug (Text, unique)
   - description (Rich Text, optional)

3. Add some sample products and categories to your Strapi backend.

4. Configure permissions in Strapi:
   - Go to Settings > Roles > Public
   - Enable "find" and "findOne" permissions for Products and Categories

### 2. Frontend Configuration

1. Create a `.env` file in the root of your project with the following content:
   ```
   VITE_API_URL=http://localhost:1337/api
   ```
   Replace the URL with your actual Strapi API URL.

2. If your Strapi backend is running on a different port or host, update the `.env` file accordingly.

## Using the Strapi Integration

The integration provides the following features:

### Authentication

- User registration and login using Strapi's authentication system
- Token-based authentication for protected routes
- Automatic token storage in localStorage

### Products

- Fetching all products with pagination
- Filtering products by category
- Searching products
- Sorting products by name, price, and rating
- Featured products display

### Categories

- Fetching all categories
- Filtering products by category

## API Services

The integration includes the following API services:

- `api.ts`: Base API service with authentication and request handling
- `products.ts`: Service for product-related API calls
- `categories.ts`: Service for category-related API calls

## React Query Integration

The project uses React Query for data fetching, caching, and state management. Custom hooks are provided in `use-api.ts` to simplify API calls:

- `useApiQuery`: For GET requests
- `useApiMutation`: For POST requests
- `useApiPutMutation`: For PUT requests
- `useApiDeleteMutation`: For DELETE requests

## Troubleshooting

If you encounter issues with the Strapi integration:

1. Check that your Strapi server is running
2. Verify that the API URL in the `.env` file is correct
3. Ensure that permissions are properly configured in Strapi
4. Check the browser console for any error messages
5. Verify that your content types in Strapi match the expected structure

## Additional Resources

- [Strapi Documentation](https://docs.strapi.io)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)