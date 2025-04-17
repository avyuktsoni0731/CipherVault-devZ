"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EncryptionKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encryptionKey: string;
  onCopyKey: () => void;
}

export function EncryptionKeyModal({
  open,
  onOpenChange,
  encryptionKey,
  onCopyKey,
}: EncryptionKeyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Encrypted Successfully</DialogTitle>
          <DialogDescription>
            Save this encryption key. You will need it to decrypt and download
            your file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="encryption-key" className="text-sm font-medium">
              Encryption Key
            </label>
            <div className="flex gap-2">
              <Input
                id="encryption-key"
                type="text"
                value={encryptionKey}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                type="button"
                size="icon"
                onClick={onCopyKey}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </Button>
            </div>
            <p className="text-xs text-red-500 font-medium">
              Important: Store this key safely. You cannot recover files without
              it.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => onOpenChange(false)}
          >
            I've Saved My Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
