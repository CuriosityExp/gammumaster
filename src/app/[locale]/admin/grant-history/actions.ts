'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, TransactionType } from "@/generated/prisma";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 20;

export async function getFacilitatorGrantHistory(
  facilitatorId: string,
  page: number = 1,
  type?: TransactionType
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'facilitator')) {
      return { transactions: [], totalCount: 0, totalPages: 0 };
    }

    // First check if facilitator exists in UserFacilitator model
    const facilitator = await prisma.userFacilitator.findUnique({
      where: { facilitatorId },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!facilitator) {
      return { transactions: [], totalCount: 0, totalPages: 0 };
    }

    // If facilitator, only show their own grants
    if (session.user.role === 'facilitator' && session.user.id !== facilitator.userId) {
      return { transactions: [], totalCount: 0, totalPages: 0 };
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const where = {
      facilitatorId,
      ...(type ? { type } : {}),
    };

    const [transactions, totalCount] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              userId: true,
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
    console.error('Error fetching facilitator grant history:', error);
    return { transactions: [], totalCount: 0, totalPages: 0 };
  }
}

export async function getFacilitatorGrantSummary(facilitatorId: string) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'facilitator')) {
      return {
        totalGranted: 0,
        totalTransactions: 0,
        byType: {
          ADMIN_GRANT: 0,
          EVENT_TOPUP: 0,
          PRIZE_REDEEM: 0,
        },
      };
    }

    // First check if facilitator exists in UserFacilitator model
    const facilitator = await prisma.userFacilitator.findUnique({
      where: { facilitatorId },
      include: {
        user: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!facilitator) {
      return {
        totalGranted: 0,
        totalTransactions: 0,
        byType: {
          ADMIN_GRANT: 0,
          EVENT_TOPUP: 0,
          PRIZE_REDEEM: 0,
        },
      };
    }

    // If facilitator, only show their own summary
    if (session.user.role === 'facilitator' && session.user.id !== facilitator.userId) {
      return {
        totalGranted: 0,
        totalTransactions: 0,
        byType: {
          ADMIN_GRANT: 0,
          EVENT_TOPUP: 0,
          PRIZE_REDEEM: 0,
        },
      };
    }

    const transactions = await prisma.pointTransaction.findMany({
      where: { facilitatorId },
      select: {
        amount: true,
        type: true,
      },
    });
    
    const summary = {
      totalGranted: 0,
      totalTransactions: transactions.length,
      byType: {
        ADMIN_GRANT: 0,
        EVENT_TOPUP: 0,
        PRIZE_REDEEM: 0,
      },
    };

    for (const transaction of transactions) {
      summary.totalGranted += Math.abs(transaction.amount);
      if (transaction.type in summary.byType) {
        summary.byType[transaction.type] += Math.abs(transaction.amount);
      }
    }

    return summary;
  } catch (error) {
    console.error('Error fetching facilitator grant summary:', error);
    return {
      totalGranted: 0,
      totalTransactions: 0,
      byType: {
        ADMIN_GRANT: 0,
        EVENT_TOPUP: 0,
        PRIZE_REDEEM: 0,
      },
    };
  }
}