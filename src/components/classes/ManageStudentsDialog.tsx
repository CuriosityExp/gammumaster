"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2 } from "lucide-react";
import { getClassWithUsers, getAllUsers, assignUserToClass, removeUserFromClass } from '@/app/[locale]/admin/classes/actions';
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface User {
  userId: string;
  name: string | null;
  email: string | null;
  qrCodeIdentifier: string;
}

interface ClassWithUsers {
  classId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  userClasses: Array<{
    user: User;
  }>;
}

interface ManageStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
}

export default function ManageStudentsDialog({ open, onOpenChange, classId }: ManageStudentsDialogProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  
  const [selectedClass, setSelectedClass] = React.useState<ClassWithUsers | null>(null);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [assigningUserId, setAssigningUserId] = React.useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && classId) {
      loadClassData();
    }
  }, [open, classId]);

  const loadClassData = async () => {
    if (!classId) return;
    
    setUsersLoading(true);
    try {
      const [classData, users] = await Promise.all([
        getClassWithUsers(classId),
        getAllUsers()
      ]);
      
      setSelectedClass(classData);
      setAllUsers(users);
    } catch (error) {
      toast.error('Failed to load class data');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedClass) return;
    
    setAssigningUserId(userId);
    const result = await assignUserToClass(userId, selectedClass.classId);
    if (result.success) {
      toast.success(result.message);
      const updatedClass = await getClassWithUsers(selectedClass.classId);
      setSelectedClass(updatedClass);
    } else {
      toast.error(result.message);
    }
    setAssigningUserId(null);
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedClass) return;
    
    setRemovingUserId(userId);
    const result = await removeUserFromClass(userId, selectedClass.classId);
    if (result.success) {
      toast.success(result.message);
      const updatedClass = await getClassWithUsers(selectedClass.classId);
      setSelectedClass(updatedClass);
    } else {
      toast.error(result.message);
    }
    setRemovingUserId(null);
  };

  const enrolledUserIds = selectedClass?.userClasses.map(uc => uc.user.userId) || [];
  const availableUsers = allUsers.filter(user => !enrolledUserIds.includes(user.userId));
  const filteredUsers = availableUsers.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('manageStudents')} - {selectedClass?.title}</DialogTitle>
          <DialogDescription>
            {t('addOrRemoveStudents')}
          </DialogDescription>
        </DialogHeader>

        {usersLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            {tCommon('loading')}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enrolled Students */}
            <div>
              <h3 className="font-semibold mb-3">{t('enrolledStudents')} ({selectedClass?.userClasses.length || 0})</h3>
              {selectedClass?.userClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noStudentsEnrolled')}</p>
              ) : (
                <div className="space-y-2">
                  {selectedClass?.userClasses.map(({ user }) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name || t('unnamedUser')}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveUser(user.userId)}
                        disabled={removingUserId === user.userId}
                      >
                        {removingUserId === user.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Students */}
            <div>
              <h3 className="font-semibold mb-3">{t('addStudents')}</h3>
              <Input
                placeholder={t('searchUsers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
              {availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('allUsersEnrolled')}</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noUsersFound')}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{user.name || t('unnamedUser')}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignUser(user.userId)}
                        disabled={assigningUserId === user.userId}
                      >
                        {assigningUserId === user.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            {t('addToClass')}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
