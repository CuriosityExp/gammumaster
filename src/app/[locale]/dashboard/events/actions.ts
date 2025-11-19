'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 10;

export async function getUserEvents(
  userId: string,
  page: number = 1,
  searchQuery: string = ''
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'user' || session.user.id !== userId) {
      return { events: [], totalCount: 0, totalPages: 0 };
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const where = {
      userId,
      ...(searchQuery ? {
        event: {
          OR: [
            { title: { contains: searchQuery } },
            { description: { contains: searchQuery } },
          ],
        },
      } : {}),
    };

    const [attendances, totalCount] = await Promise.all([
      prisma.userEventAttendance.findMany({
        where,
        include: {
          event: true,
        },
        orderBy: { attendedAt: 'desc' },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.userEventAttendance.count({ where }),
    ]);

    return {
      events: attendances.map(a => ({
        ...a.event,
        attendedAt: a.attendedAt,
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error('Error fetching user events:', error);
    return { events: [], totalCount: 0, totalPages: 0 };
  }
}
