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

interface AnalyzeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyzeKey: string;
  setAnalyzeKey: (key: string) => void;
  onAnalyze: () => void;
  error: string;
  result: {
    risk_level: string;
    score: number;
    summary: string;
  } | null;
}

export function AnalyzeModal({
  open,
  onOpenChange,
  analyzeKey,
  setAnalyzeKey,
  onAnalyze,
  error,
  result,
}: AnalyzeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Analyze File</DialogTitle>
          <DialogDescription>
            Enter the encryption key to decrypt the file before analyzing it
            with our AI-powered risk assessment engine.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="analyze-key" className="text-sm font-medium">
              Encryption Key
            </label>
            <Input
              id="analyze-key"
              type="text"
              value={analyzeKey}
              onChange={(e) => setAnalyzeKey(e.target.value)}
              className={`font-mono ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
          </div>

          {result && (
            <div className="p-3 rounded-md bg-gray-100 border text-sm leading-relaxed space-y-1">
              <p>
                <span className="font-semibold">Risk Level:</span>{" "}
                <span
                  className={`${
                    result.risk_level === "High"
                      ? "text-red-600"
                      : result.risk_level === "Moderate"
                      ? "text-yellow-600"
                      : "text-green-600"
                  } font-semibold`}
                >
                  {result.risk_level}
                </span>
              </p>
              <p>
                <span className="font-semibold">Score:</span> {result.score}/100
              </p>
              <p className="text-gray-700 text-xs italic">{result.summary}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAnalyze}>Analyze</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
