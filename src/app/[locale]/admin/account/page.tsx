import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { QrManager } from "@/components/admin/QrManager";
import { ClickableQRIdentifier } from "@/components/admin/ClickableQRIdentifier";
import { EditAccountDialog } from "@/components/admin/EditAccountDialog";
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Shield, Calendar, TrendingUp, QrCode, Coins } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

async function getAdmin(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { adminId },
  });
  return admin;
}

async function getFacilitatorUser(facilitatorId: string) {
  const facilitator = await prisma.userFacilitator.findUnique({
    where: { facilitatorId },
    include: {
      user: true,
    },
  });
  return facilitator?.user;
}

export default async function AdminAccountPage({
  params
}: {
  readonly params: Promise<{ readonly locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const session = await getServerSession(authOptions);

  // Protect the page: if no session or user ID, redirect to login
  if (!session?.user?.id) {
    redirect({ href: "/admin/login", locale });
  }

  // Allow both admins and facilitators to access this page
  if (session.user.role !== "admin" && session.user.role !== "facilitator") {
    redirect({ href: "/admin/login", locale });
  }

  // Get user data based on role
  let userData: any;
  if (session.user.role === "facilitator") {
    userData = await getFacilitatorUser(session.user.facilitatorId);
  } else {
    userData = await getAdmin(session.user.id);
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-8">
        <p>{t('admin.accountNotFound')}</p>
      </div>
    );
  }

  // Fetch additional data for facilitators
  const facilitator = session.user.role === "facilitator" ? await prisma.userFacilitator.findUnique({
    where: { facilitatorId: session.user.facilitatorId }
  }) : null;

  const transactions = session.user.role === "facilitator" ? await prisma.pointTransaction.findMany({
    where: { userId: userData.userId },
    include: { admin: { select: { email: true } }, facilitator: { select: { userId: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10
  }) : [];

  const eventAttendances = session.user.role === "facilitator" ? await prisma.userEventAttendance.findMany({
    where: { userId: userData.userId },
    include: { event: { select: { title: true, pointAmount: true } } },
    orderBy: { attendedAt: 'desc' },
    take: 10
  }) : [];

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <Button asChild variant="outline" className="flex items-center gap-2 w-fit">
          <Link href={`/${locale}/admin`}>
            <ArrowLeft className="h-4 w-4" />
            {t('admin.backToDashboard')}
          </Link>
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">{t('admin.myAccount')}</h1>
        <div className="hidden sm:block sm:w-32"></div> {/* Spacer for centering on desktop */}
      </div>
      <Card className="mb-8 shadow-md border-0 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('admin.accountDetails')}
          </CardTitle>
          <CardAction>
            <EditAccountDialog 
              userId={session.user.role === "facilitator" ? userData.userId : session.user.id}
              userName={userData.name}
              userEmail={userData.email}
              role={session.user.role}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('admin.basicInformation')}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 text-blue-500" />
                  {t('admin.name')}:
                </div>
                <div>{userData.name || 'N/A'}</div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-green-500" />
                  {t('admin.email')}:
                </div>
                <div>{userData.email || 'N/A'}</div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-purple-500" />
                  {t('admin.role')}:
                </div>
                <div><Badge variant={session.user.role === 'admin' ? 'default' : 'secondary'} className="mt-1 w-fit">
                  {session.user.role === 'admin' ? t('admin.adminRole') : t('admin.facilitatorRole')}
                </Badge></div>
                
                {session.user.role === "facilitator" && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      {t('admin.currentPoints')}:
                    </div>
                    <div className="font-semibold">{userData.points.toLocaleString()}</div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <QrCode className="h-4 w-4 text-gray-500" />
                      {t('admin.qrIdentifier')}:
                    </div>
                    <div className="font-mono text-xs">
                      <ClickableQRIdentifier 
                        identifier={userData.qrCodeIdentifier} 
                        userData={userData} 
                        isFacilitator={session.user.role === "facilitator"} 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      {t('admin.availablePointsToGrantLabel')}:
                    </div>
                    <div className="font-semibold">{facilitator?.availablePointsToGrant.toLocaleString() || 'N/A'}</div>
                  </>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-red-500" />
                  {t('admin.createdAt')}:
                </div>
                <div>{new Date(userData.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Recent Transactions */}
            {session.user.role === "facilitator" && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('admin.recentTransactions')}
                </h3>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="border rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {tx.amount > 0 ? "+" : ""}{tx.amount} points
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {tx.description || "No description"}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {tx.admin?.email || (tx.facilitator ? "Facilitator" : "System")}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t('admin.noTransactionsYet')}
                  </div>
                )}
              </div>
            )}

            {/* Recent Event Attendances */}
            {session.user.role === "facilitator" && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('admin.recentEventAttendances')}
                </h3>
                {eventAttendances.length > 0 ? (
                  <div className="space-y-2">
                    {eventAttendances.map((attendance) => (
                      <div key={attendance.id} className="border rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{attendance.event.title}</div>
                            <div className="text-muted-foreground text-xs">
                              +{attendance.event.pointAmount} points earned
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(attendance.attendedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t('admin.noEventAttendancesYet')}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}