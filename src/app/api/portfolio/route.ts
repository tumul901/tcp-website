import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 9;
    const skip = (page - 1) * limit;

    const categoryId = searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : null;
    const sort = (searchParams.get('sort') || 'latest').toLowerCase();
    const search = searchParams.get('search')?.trim() || '';

    // Build WHERE clause
    let whereClause: any = { isDeleted: false };

    // Category filter (1 = All)
    if (categoryId && categoryId !== 1) {
      whereClause.category_id = categoryId;
    }

    // Search filter
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    // Sorting logic
    let orderBy: any = { created_at: 'desc' };
    if (sort === 'atoz') orderBy = { title: 'asc' };
    else if (sort === 'ztoa') orderBy = { title: 'desc' };

    let totalItems: number, items: any[];

    if (sort === 'atoz' || sort === 'ztoa') {
      [totalItems, items] = await Promise.all([
        prisma.portfolioItem.count({ where: whereClause }),
        prisma.portfolioItem.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
        }),
      ]);
    } else {
      if (!categoryId || categoryId === 1) {
        const whereCategory9: any = { category_id: 9, isDeleted: false };
        const whereOthers: any = { NOT: { category_id: 9 }, isDeleted: false };

        if (search) {
          whereCategory9.title = { contains: search, mode: 'insensitive' };
          whereOthers.title = { contains: search, mode: 'insensitive' };
        }

        const [category9Items, otherItems] = await Promise.all([
          prisma.portfolioItem.findMany({
            where: whereCategory9,
            orderBy: { created_at: 'desc' },
          }),
          prisma.portfolioItem.findMany({
            where: whereOthers,
            orderBy: { created_at: 'desc' },
          }),
        ]);

        const combined = [...category9Items, ...otherItems];
        totalItems = combined.length;
        items = combined.slice(skip, skip + limit);
      } else {
        [totalItems, items] = await Promise.all([
          prisma.portfolioItem.count({ where: whereClause }),
          prisma.portfolioItem.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },
          }),
        ]);
      }
    }

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
      filters: {
        sort,
        category_id: categoryId || 'none',
        search: search || null,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Error fetching portfolio items' }, { status: 500 });
  }
}
