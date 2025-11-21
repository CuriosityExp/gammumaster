"use server";

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function getAllClasses() {
  return prisma.class.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getClassById(classId: string) {
  return prisma.class.findUnique({
    where: { classId },
  });
}

export async function createClass(data: {
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
}) {
  return prisma.class.create({
    data,
  });
}

export async function updateClass(classId: string, data: {
  title?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
}) {
  return prisma.class.update({
    where: { classId },
    data,
  });
}

export async function deleteClass(classId: string) {
  return prisma.class.update({
    where: { classId },
    data: { deletedAt: new Date() },
  });
}

export async function getClassWithUsers(classId: string) {
  return prisma.class.findUnique({
    where: { classId },
    include: {
      userClasses: {
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
              qrCodeIdentifier: true,
            }
          }
        }
      }
    }
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      userId: true,
      name: true,
      email: true,
      qrCodeIdentifier: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function assignUserToClass(userId: string, classId: string) {
  try {
    const existing = await prisma.userClass.findUnique({
      where: {
        userId_classId: { userId, classId }
      }
    });

    if (existing) {
      return { success: false, message: 'User already enrolled in this class' };
    }

    await prisma.userClass.create({
      data: { userId, classId }
    });

    return { success: true, message: 'User assigned successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to assign user to class' };
  }
}

export async function removeUserFromClass(userId: string, classId: string) {
  try {
    await prisma.userClass.delete({
      where: {
        userId_classId: { userId, classId }
      }
    });

    return { success: true, message: 'User removed successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to remove user from class' };
  }
}
