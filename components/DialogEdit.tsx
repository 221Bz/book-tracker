"use client";

import AddDialog from "./DialogAdd";
import { ReactNode } from "react";

interface EditDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  onCancel?: () => void;
}

export default function EditDialog({
  open,
  setOpen,
  title = "Edit Data",
  children,
  onSave,
  onCancel,
}: EditDialogProps) {
  return (
    <AddDialog
      open={open}
      setOpen={setOpen}
      title={title}
      onSave={onSave}
      onCancel={onCancel}
    >
      {children} {/* <- gunakan next children, bukan props.children */}
    </AddDialog>
  );
}
