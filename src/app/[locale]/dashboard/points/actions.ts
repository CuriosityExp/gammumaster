'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, TransactionType } from "@/generated/prisma";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 20;

export async function getPointTransactions(
  userId: string,
  page: number = 1,
  type?: TransactionType
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'user' || session.user.id !== userId) {
      return { transactions: [], totalCount: 0, totalPages: 0 };
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const where = {
      userId,
      ...(type ? { type } : {}),
    };

    const [transactions, totalCount] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        include: {
          admin: {
            select: {
              email: true,
            },
          },
          facilitator: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.pointTransaction.count({ where }),
    ]);

    return {
      transactions,
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error('Error fetching point transactions:', error);
    return { transactions: [], totalCount: 0, totalPages: 0 };
  }
}

export async function getPointSummary(userId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'user' || session.user.id !== userId) {
      return {
        totalEarned: 0,
        totalSpent: 0,
        balance: 0,
        byType: {
          ADMIN_GRANT: 0,
          EVENT_TOPUP: 0,
          PRIZE_REDEEM: 0,
        },
      };
    }

    const [user, transactions] = await Promise.all([
      prisma.user.findUnique({
        where: { userId },
        select: { points: true },
      }),
      prisma.pointTransaction.findMany({
        where: { userId },
        select: {
          amount: true,
          type: true,
        },
      }),
    ]);

    const summary = {
      totalEarned: 0,
      totalSpent: 0,
      balance: user?.points || 0,
      byType: {
        ADMIN_GRANT: 0,
        EVENT_TOPUP: 0,
        PRIZE_REDEEM: 0,
      },
    };

    transactions.forEach((t) => {
      if (t.amount > 0) {
        summary.totalEarned += t.amount;
      } else {
        summary.totalSpent += Math.abs(t.amount);
      }

      if (t.type === 'ADMIN_GRANT') {
        summary.byType.ADMIN_GRANT += t.amount;
      } else if (t.type === 'EVENT_TOPUP') {
        summary.byType.EVENT_TOPUP += t.amount;
      } else if (t.type === 'PRIZE_REDEEM') {
        summary.byType.PRIZE_REDEEM += Math.abs(t.amount);
      }
    });

    return summary;
  } catch (error) {
    console.error('Error fetching point summary:', error);
    return {
      totalEarned: 0,
      totalSpent: 0,
      balance: 0,
      byType: {
        ADMIN_GRANT: 0,
        EVENT_TOPUP: 0,
        PRIZE_REDEEM: 0,
      },
    };
  }
}
