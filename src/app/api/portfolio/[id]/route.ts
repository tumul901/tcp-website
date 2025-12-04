import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const item = await prisma.portfolioItem.findUnique({ where: { id } });

    if (!item || item.isDeleted) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ message: 'Error fetching item' }, { status: 500 });
  }
}
