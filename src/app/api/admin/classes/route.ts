import { NextRequest, NextResponse } from 'next/server';
import { createClass, updateClass, deleteClass } from '@/app/[locale]/admin/classes/actions';
import { z } from 'zod';

const classSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  imageUrl: z.union([
    z.string().regex(/^https?:\/\/.+/, { message: 'Invalid URL' }),
    z.literal(''),
    z.undefined()
  ]).optional(),
  location: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  const parse = classSchema.safeParse(data);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues }, { status: 400 });
  }
  try {
    const newClass = await createClass(parse.data);
    return NextResponse.json(newClass);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create class' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  if (!id) return NextResponse.json({ error: 'Missing class id' }, { status: 400 });
  const parse = classSchema.partial().safeParse(updateData);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues }, { status: 400 });
  }
  try {
    const updated = await updateClass(id, parse.data);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'Missing class id' }, { status: 400 });
  try {
    const deleted = await deleteClass(id);
    return NextResponse.json(deleted);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete class' }, { status: 500 });
  }
}
