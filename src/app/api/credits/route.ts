import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const creditNoteSchema = z.object({
  orderId: z.string(),
  invoiceId: z.string().optional(),
  amount: z.number().positive('Le montant doit être positif'),
  reason: z.enum(['CANCELLATION', 'REFUND', 'ERROR'], {
    message: 'Raison invalide',
  }),
});

// Générer un numéro d'avoir unique
function generateCreditNoteNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CN-${year}${month}-${random}`;
}

// GET Liste des avoirs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const invoiceId = searchParams.get('invoiceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (orderId) where.orderId = orderId;
    if (invoiceId) where.invoiceId = invoiceId;

    const [creditNotesRaw, total] = await Promise.all([
      prisma.creditNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.creditNote.count({ where }),
    ]);

    const creditNotes = await Promise.all(
      creditNotesRaw.map(async (cn) => {
        const order = await prisma.order.findUnique({
          where: { id: cn.orderId },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            user: {
              select: { email: true, firstName: true, lastName: true },
            },
          },
        });

        // Schema does not currently store invoiceId on CreditNote model
        // so we don't include invoice here.
        return {
          ...cn,
          order: order || null,
          invoice: null,
        };
      })
    );

    return NextResponse.json({
      creditNotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET Credit notes error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avoirs' },
      { status: 500 }
    );
  }
}

// POST Créer un avoir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = creditNoteSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      select: { id: true, total: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    const creditNotesForOrder = await prisma.creditNote.findMany({
      where: { orderId: validatedData.orderId },
    });

    const totalCreditNotes = creditNotesForOrder.reduce(
      (sum, cn) => sum + Number(cn.amount),
      0
    );
    const remainingAmount = Number(order.total) - totalCreditNotes;

    if (validatedData.amount > remainingAmount) {
      return NextResponse.json(
        { 
          error: `Le montant de l'avoir ne peut pas dépasser ${remainingAmount.toFixed(2)}€` 
        },
        { status: 400 }
      );
    }

    if (validatedData.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: validatedData.invoiceId },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: 'Facture non trouvée' },
          { status: 404 }
        );
      }

      if (invoice.orderId !== validatedData.orderId) {
        return NextResponse.json(
          { error: 'La facture ne correspond pas à cette commande' },
          { status: 400 }
        );
      }
    }

    const creditNote = await prisma.creditNote.create({
      data: {
        orderId: validatedData.orderId,
        amount: validatedData.amount,
        reason: validatedData.reason,
        creditNumber: generateCreditNoteNumber(),
      },
    });

    // Fetch related order and invoice for response
    const orderWithUser = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    const invoice = validatedData.invoiceId
      ? await prisma.invoice.findUnique({
          where: { id: validatedData.invoiceId },
        })
      : null;

    const creditNoteWithRelations = {
      ...creditNote,
      order: orderWithUser || null,
      invoice,
    };

    const totalAfterCredit = totalCreditNotes + validatedData.amount;
    if (totalAfterCredit >= Number(order.total)) {
      await prisma.order.update({
        where: { id: validatedData.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return NextResponse.json(creditNote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST Credit note error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'avoir' },
      { status: 500 }
    );
  }
}