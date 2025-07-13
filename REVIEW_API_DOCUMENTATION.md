# Product Review API Documentation

## Overview
This document outlines the API requirements for the product review system. The system allows customers to submit reviews for products and displays average ratings across the application.

## API Endpoint
Base URL: `https://api.dharaniherbbals.com/api/product-reviews`

## Data Model

### Review Entity Fields
```json
{
  "user": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "ecom-user"
  },
  "product": {
    "type": "relation", 
    "relation": "manyToOne",
    "target": "product-master"
  },
  "rating": {
    "type": "integer",
    "min": 1,
    "max": 5,
    "required": true
  },
  "comment": {
    "type": "text",
    "required": true
  },
  "isActive": {
    "type": "boolean",
    "default": false
  },
  "skuId": {
    "type": "string",
    "required": false
  }
}
```

## API Endpoints

### 1. Submit Review (POST)
**Endpoint:** `POST /api/product-reviews`

**Request Body:**
```json
{
  "data": {
    "user": 123,
    "product": 456,
    "rating": 5,
    "comment": "Great product! Highly recommended.",
    "skuId": "SKU-12345",
    "isActive": false
  }
}
```

**Response:**
```json
{
  "data": {
    "id": 789,
    "attributes": {
      "user": 123,
      "product": 456,
      "rating": 5,
      "comment": "Great product! Highly recommended.",
      "skuId": "SKU-12345",
      "isActive": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Get Product Reviews (GET)
**Endpoint:** `GET /api/product-reviews`

**Query Parameters:**
- `filters[product][$eq]=456` - Filter by product ID
- `filters[isActive][$eq]=true` - Only active/approved reviews
- `filters[skuId][$eq]=SKU-12345` - Filter by SKU (optional)
- `populate[user][fields][0]=username` - Include user info
- `sort=createdAt:desc` - Sort by creation date

**Example URL:**
```
GET /api/product-reviews?filters[product][$eq]=456&filters[isActive][$eq]=true&populate[user][fields][0]=username&sort=createdAt:desc
```

**Response:**
```json
{
  "data": [
    {
      "id": 789,
      "attributes": {
        "user": 123,
        "product": 456,
        "rating": 5,
        "comment": "Great product!",
        "skuId": "SKU-12345",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "user_info": {
          "data": {
            "id": 123,
            "attributes": {
              "username": "john_doe",
              "email": "john@example.com"
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### 3. Bulk Review Stats (GET)
**Endpoint:** `GET /api/product-reviews`

**Query Parameters:**
- `filters[isActive][$eq]=true` - Only active reviews
- `filters[product][$in]=123,456,789` - Multiple product IDs
- `populate[product][fields][0]=id` - Include product ID

**Example URL:**
```
GET /api/product-reviews?filters[isActive][$eq]=true&filters[product][$in]=123,456,789&populate[product][fields][0]=id
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "rating": 5,
        "product": {
          "data": {
            "id": 123
          }
        }
      }
    },
    {
      "id": 2,
      "attributes": {
        "rating": 4,
        "product": {
          "data": {
            "id": 123
          }
        }
      }
    }
  ]
}
```

### 4. Admin - Get Pending Reviews (GET)
**Endpoint:** `GET /api/product-reviews`

**Query Parameters:**
- `filters[isActive][$eq]=false` - Only pending reviews
- `populate[user][fields][0]=username`
- `populate[user][fields][1]=email`
- `populate[product][fields][0]=Name`
- `populate[product][fields][1]=photo`
- `sort=createdAt:desc`

### 5. Admin - Approve/Reject Review (PUT)
**Endpoint:** `PUT /api/product-reviews/{id}`

**Request Body:**
```json
{
  "data": {
    "isActive": true
  }
}
```

## Frontend Integration

### Components Used
1. **ProductReviews.tsx** - Displays reviews and stats
2. **ReviewForm.tsx** - Submit new reviews
3. **StarRating.tsx** - Display star ratings
4. **AdminReviews.tsx** - Admin review management

### Key Features
- ✅ Submit reviews (pending approval)
- ✅ Display approved reviews only
- ✅ Calculate average ratings
- ✅ Show rating distribution
- ✅ Bulk fetch review stats for product listings
- ✅ SKU-based filtering
- ✅ Admin approval system

### Display Locations
- Product detail pages (full reviews + form)
- Product listings (star ratings only)
- Featured products (star ratings)
- Trending products (star ratings)
- Hot selling products (star ratings)

## Security Considerations

1. **Authentication Required**: Users must be logged in to submit reviews
2. **Approval System**: Reviews are inactive by default, require admin approval
3. **Input Validation**: Rating must be 1-5, comment is required
4. **Rate Limiting**: Consider implementing rate limiting for review submissions
5. **Spam Protection**: Monitor for duplicate reviews from same user for same product

## Performance Optimization

1. **Bulk Queries**: Use bulk API calls for product listings
2. **Caching**: Consider caching review stats for frequently accessed products
3. **Pagination**: Implement pagination for products with many reviews
4. **Lazy Loading**: Load reviews on demand in product detail pages

## Error Handling

The frontend handles various error scenarios:
- Network failures
- Invalid API responses
- Missing user authentication
- Invalid rating values
- Empty comments

## Testing Checklist

- [ ] Submit review as authenticated user
- [ ] Verify review appears as pending (isActive: false)
- [ ] Admin can approve/reject reviews
- [ ] Approved reviews appear in product listings
- [ ] Star ratings calculate correctly
- [ ] Bulk stats work for multiple products
- [ ] SKU filtering works correctly
- [ ] Error handling works for all scenarios

## API Response Examples

### Successful Review Submission
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "user": 123,
      "product": 456,
      "rating": 5,
      "comment": "Excellent product!",
      "isActive": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Response
```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Rating must be between 1 and 5",
    "details": {
      "errors": [
        {
          "path": ["rating"],
          "message": "Rating must be between 1 and 5"
        }
      ]
    }
  }
}
```