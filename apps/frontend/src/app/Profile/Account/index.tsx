import { useState } from "react";

import { LogOut, Trash } from "iconoir-react";

import { Button } from "@repo/theme";

import { useDeleteAccount } from "@/hooks/api/users";
import useUser from "@/hooks/useUser";
import { signOut } from "@/lib/api";

// eslint-disable-next-line css-modules/no-unused-class
import profileStyles from "../Profile.module.scss";
import styles from "./Account.module.scss";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

export default function Account() {
  const { user } = useUser();
  const [deleteAccount] = useDeleteAccount();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    await deleteAccount();
    // After deletion, sign out and redirect to home
    signOut("/");
  };

  return (
    <div className={profileStyles.contentInner}>
      <h1 className={profileStyles.pageTitle}>Account</h1>
      <div className={profileStyles.pageContent}>
        <div className={profileStyles.section}>
          <h2 className={profileStyles.sectionTitle}>Personal Information</h2>
          <div>
            <div className={styles.infoItem}>
              <label>Full Name</label>
              <span className={styles.infoValue}>{user?.name}</span>
            </div>
            <div className={styles.infoItem}>
              <label>bConnected Email</label>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Student Account</label>
              <span className={styles.infoValue}>
                {user?.student ? "Yes" : "No"}
              </span>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="tertiary"
              onClick={() => signOut()}
              style={{ color: "var(--red-500)" }}
            >
              <LogOut width={16} height={16} />
              Sign Out
            </Button>
            <Button
              variant="tertiary"
              onClick={() => setIsDeleteDialogOpen(true)}
              style={{ color: "var(--red-500)" }}
            >
              <Trash width={16} height={16} />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
