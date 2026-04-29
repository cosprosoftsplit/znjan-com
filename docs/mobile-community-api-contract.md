# Mobile Community API Contract

## Goal

Define a stable read-first community contract for native apps while keeping moderation and auth rules consistent with the website.

## Implemented Mobile Endpoints

- `GET /api/mobile/v1/community/feed`
- `GET /api/mobile/v1/community/posts/:id`

These endpoints are read-focused and app-safe.

## Feed Contract

### `GET /api/mobile/v1/community/feed`

Supported query params:
- `page`
- `limit`
- `type`
- `category`
- `lang`

Only approved posts are returned.

Payload guarantees:
- normalized viewer object
- explicit filters block
- explicit pagination block
- normalized post summaries

Each post summary includes:
- ids and author object
- type/category
- title/body
- location and event fields
- join/comment counts
- view count
- created/updated timestamps

## Detail Contract

### `GET /api/mobile/v1/community/posts/:id`

Behavior:
- approved posts are public
- pending/rejected posts remain hidden except to owner/admin
- approved post views still increment here, matching the website behavior

Detail payload includes:
- normalized post summary
- comments with author objects
- joiners
- `hasJoined`
- `viewerCanEdit`
- `viewerCanDelete`

## Why This Contract Exists

The original website endpoints were serviceable, but not ideal for native clients because:
- pagination semantics were minimal
- author fields were flattened into page-era names
- viewer capabilities were implicit
- payload shape was optimized for the current web templates

The mobile contract fixes that without changing the underlying moderation rules.

## Planned Write Contract

Not yet versioned under `/api/mobile/v1/community/*`, but planned next:
- create post
- add comment
- join meetup
- leave meetup
- edit own post
- delete own post

Those write endpoints should preserve:
- moderation workflow
- rate limits
- anti-abuse checks
- badge and points side effects

## Pagination Rules

The feed guarantees:
- `page`
- `limit`
- `total`
- `totalPages`
- `hasNextPage`

The app should use these values directly instead of inferring pagination from item count alone.

## Viewer Rules

Responses include:
- `viewer.isAuthenticated`
- `viewer.user`

This lets the app decide whether to:
- show join/comment actions
- display edit/delete affordances
- redirect into login

## Moderation Compatibility

The app contract must never bypass the community moderation model.

That means:
- only approved posts are public in feeds
- unapproved posts remain visible only to owner/admin
- app writes should continue to create pending content unless policy explicitly changes
