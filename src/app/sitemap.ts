import { MetadataRoute } from 'next';
import { services } from '@/data/services';

/**
 * Dynamic sitemap generation for CloudPlay XP website
 * This file generates a sitemap.xml that helps search engines discover and index all pages
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use environment variable or fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Static routes - Core pages of the website
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
  
  // Dynamic service routes - Generated from services data
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  
  // Dynamic portfolio routes - Fetch from API
  let portfolioRoutes: MetadataRoute.Sitemap = [];
  
  try {
    // Attempt to fetch portfolio items from the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/portfolio`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });
      
      if (response.ok) {
        const portfolioItems = await response.json();
        
        if (Array.isArray(portfolioItems)) {
          portfolioRoutes = portfolioItems.map((item: any) => ({
            url: `${baseUrl}/portfolio/${item.id}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          }));
        }
      }
    }
  } catch (error) {
    // Silently fail if API is not available (e.g., during build time)
    console.warn('Failed to fetch portfolio items for sitemap:', error);
    
    // Fallback: Add placeholder portfolio routes
    portfolioRoutes = Array.from({ length: 10 }, (_, i) => ({
      url: `${baseUrl}/portfolio/${i + 1}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  }
  
  // Combine all routes
  return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes];
}
