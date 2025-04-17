"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccessLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: { time: string; ip: string }[];
}

export function AccessLogModal({
  open,
  onOpenChange,
  logs,
}: AccessLogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access Logs</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2 max-h-[300px] overflow-auto">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No downloads yet.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="text-sm text-muted-foreground">
                📥 {new Date(log.time).toLocaleString()} from {log.ip}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
