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

interface DownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadKey: string;
  setDownloadKey: (key: string) => void;
  keyError: boolean;
  setKeyError: (error: boolean) => void;
  onDownload: () => void;
}

export function DownloadModal({
  open,
  onOpenChange,
  downloadKey,
  setDownloadKey,
  keyError,
  setKeyError,
  onDownload,
}: DownloadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Decryption Key</DialogTitle>
          <DialogDescription>
            To decrypt and download this file, enter the encryption key that was
            provided when you uploaded it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="decryption-key" className="text-sm font-medium">
              Decryption Key
            </label>
            <Input
              id="decryption-key"
              type="text"
              value={downloadKey}
              onChange={(e) => {
                setDownloadKey(e.target.value);
                setKeyError(false);
              }}
              className={`font-mono ${
                keyError ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {keyError && (
              <p className="text-xs text-red-500 font-medium">
                Invalid key. Please check your key and try again.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onDownload}
          >
            Decrypt & Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
