# Blog Section

This directory contains the blog section of the picluxe application. The blog features articles about AI image upscaling, technology trends, design tips, and tutorials.

## Structure

- `layout.tsx` - The layout wrapper for all blog pages
- `page.tsx` - The main blog listing page with grid layout and pagination
- `[id]/page.tsx` - Dynamic route for individual blog posts

## Features

1. **Responsive Grid Layout**
   - 3-column grid on desktop
   - 2-column grid on tablets
   - Single column on mobile

2. **Search and Filtering**
   - Search by title or content
   - Filter by category (Technology, AI, Design, Tutorial)

3. **Pagination**
   - Shows 9 posts per page
   - Smooth scrolling when changing pages

4. **Individual Blog Posts**
   - Rich content display with proper typography
   - Author information
   - Related posts section
   - Social sharing options (to be implemented)

## Mock Data

Currently, the blog uses mock data for development purposes. In production, this would be replaced with:
- API calls to a backend service
- CMS integration (e.g., Contentful, Sanity, Strapi)
- Database queries

## Styling

The blog section uses Tailwind CSS for styling with a consistent dark theme that matches the rest of the application. Key design elements include:
- Black backgrounds with subtle gradients
- Orange accent colors for interactive elements
- Card-based design for blog posts
- Hover animations for interactive elements

## Future Enhancements

- Comment system
- Newsletter subscription
- Author pages
- Related content recommendations
- Reading time estimates
- View count tracking 