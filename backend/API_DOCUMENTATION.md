# API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Plan Limits

The system supports 4 plan types:
- **Free**: 1 display, 1 user, 1GB storage, 5 playlists, 5 layouts, 3 schedules
- **Basic**: 5 displays, 3 users, 10GB storage, 20 playlists, 20 layouts, 10 schedules
- **Premium**: 25 displays, 10 users, 100GB storage, unlimited playlists/layouts/schedules
- **Kurumsal**: Unlimited everything, white-label support

## Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (with pagination)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (admin/manager only, checks user limit)
- `PUT /api/users/:id` - Update user (admin/manager only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Displays
- `GET /api/displays` - List displays (with filters)
- `GET /api/displays/:id` - Get display details
- `POST /api/displays` - Create display (checks display limit)
- `PUT /api/displays/:id` - Update display
- `DELETE /api/displays/:id` - Delete display
- `POST /api/displays/:id/pair` - Pair display with pair code
- `GET /api/displays/:id/status` - Get display status
- `POST /api/displays/:id/heartbeat` - Update display heartbeat
- `POST /api/displays/:id/restart` - Restart display

### Media Library
- `GET /api/media` - List media files (with filters)
- `GET /api/media/:id` - Get media file details
- `POST /api/media/upload` - Upload media file (checks file size and storage limits)
- `PUT /api/media/:id` - Update media file
- `DELETE /api/media/:id` - Delete media file
- `GET /api/media/stats` - Get media statistics

### Layouts
- `GET /api/layouts` - List layouts
- `GET /api/layouts/:id` - Get layout with elements
- `POST /api/layouts` - Create layout (checks layout limit)
- `PUT /api/layouts/:id` - Update layout
- `DELETE /api/layouts/:id` - Delete layout
- `POST /api/layouts/:id/duplicate` - Duplicate layout

### Playlists
- `GET /api/playlists` - List playlists
- `GET /api/playlists/:id` - Get playlist with items
- `POST /api/playlists` - Create playlist (checks playlist limit)
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/duplicate` - Duplicate playlist
- `PUT /api/playlists/:id/items/reorder` - Reorder playlist items

### Schedules
- `GET /api/schedules` - List schedules
- `GET /api/schedules/:id` - Get schedule details
- `POST /api/schedules` - Create schedule (checks schedule limit)
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Analytics (Premium feature)
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/displays` - Get display analytics
- `GET /api/analytics/content` - Get top content
- `POST /api/analytics/events` - Log analytics event

### Applications/Widgets
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Settings
- `GET /api/settings` - Get settings (optionally filtered by category)
- `PUT /api/settings` - Update setting

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Plans & Billing
- `GET /api/plans` - List all available plans
- `GET /api/plans/current` - Get current plan and limits
- `GET /api/plans/usage` - Get detailed usage statistics
- `POST /api/plans/upgrade` - Upgrade plan
- `POST /api/plans/downgrade` - Downgrade plan
- `GET /api/plans/billing` - Get billing information

### Player API (for display devices)
- `POST /api/player/register` - Register display device with pair code
- `GET /api/player/content` - Get content to play (requires player token)
- `POST /api/player/heartbeat` - Send heartbeat (requires player token)
- `GET /api/player/media/:id` - Get media file URL (requires player token)

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": [] // Optional, for validation errors
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (plan limit exceeded, feature not available)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Plan Limit Errors

When a plan limit is exceeded:
```json
{
  "error": "Plan limit exceeded",
  "metric": "displays",
  "current": 5,
  "limit": 5,
  "message": "Your basic plan allows 5 displays. Please upgrade to add more."
}
```

## Multi-Tenant

All endpoints automatically filter by tenant_id. Users can only access resources from their own tenant.

