import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortfolioItemDetail, { PortfolioItem } from '@/components/portfolio/PortfolioItemDetail';

// --- TYPE DEFINITIONS ---

interface PageParams {
  id: string;
}

interface PortfolioDetailsPageProps {
  params: Promise<PageParams>;
}

interface ApiPortfolioItem {
  id: number;
  title: string;
  category_id: number;
  category_name?: string | null;
  details: any;
  description?: string | null;
  image: string;
  created_at: string;
  updated_at: string;
}

// --- DATA FETCHING ---

async function getProject(id: string): Promise<PortfolioItem | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${apiUrl}/api/portfolio/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to load project (status: ${res.status})`);
    }

    const apiData: ApiPortfolioItem = await res.json();

    // Parse details (stringified JSON) safely
    let detailsArray: any[] = [];
    try {
      const raw = typeof apiData.details === "string"
          ? JSON.parse(apiData.details)
          : apiData.details;
      if (Array.isArray(raw)) {
        detailsArray = raw;
      }
    } catch {
      detailsArray = [];
    }

    // Map details → MediaItem[]
    let mainMedia = detailsArray
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const type = d.type;
        const url = d.url;
        if (!type || !url) return null;
        if (!["youtube", "vimeo", "image", "pdf"].includes(type)) return null;
        return { type, url, caption: d.caption };
      })
      .filter(Boolean) as { type: "youtube" | "vimeo" | "image" | "pdf"; url: string; caption: any }[];

    // Fallback: if no details, use main image as a single image media
    if (mainMedia.length === 0 && apiData.image) {
      mainMedia = [{ type: "image", url: apiData.image, caption: "" }];
    }

    return {
      id: apiData.id,
      title: apiData.title,
      category: apiData.category_name || "Uncategorized",
      categoryId: apiData.category_id,
      description: apiData.description || "",
      mainMedia,
    };
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    return null;
  }
}

// --- METADATA GENERATION ---

export async function generateMetadata({ params }: PortfolioDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return {
      title: 'Project Not Found | CloudPlay XP',
      description: 'The requested project could not be found.',
    };
  }

  const mainImage = project.mainMedia.find(m => m.type === 'image')?.url || '/og-image.png';

  return {
    title: `${project.title} | CloudPlay XP Portfolio`,
    description: project.description || `View details for ${project.title} in our portfolio.`,
    openGraph: {
      title: `${project.title} | CloudPlay XP Portfolio`,
      description: project.description || `View details for ${project.title} in our portfolio.`,
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | CloudPlay XP Portfolio`,
      description: project.description || `View details for ${project.title} in our portfolio.`,
      images: [mainImage],
    },
  };
}

// --- MAIN PAGE COMPONENT ---

export default async function PortfolioDetailsPage({ params }: PortfolioDetailsPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <PortfolioItemDetail project={project} />;
}
