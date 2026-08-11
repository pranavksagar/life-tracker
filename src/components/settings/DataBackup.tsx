import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportAll, importAll, type BackupFile } from "@/data/backup";
import { todayISO } from "@/lib/date";
import { pendoTrack } from "@/lib/pendo";
import { Button } from "@/components/ui/button";

export function DataBackup() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const backup = await exportAll();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `life-tracker-backup-${todayISO()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
      pendoTrack("data_exported", {
        areas_count: backup.data.areas.length,
        tasks_count: backup.data.tasks.length,
        habits_count: backup.data.habits.length,
        goals_count: backup.data.goals.length,
        sprints_count: backup.data.sprints.length,
        exercise_count: backup.data.exercise_logs.length,
        food_count: backup.data.food_logs.length,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupFile;
      await importAll(parsed);
      await queryClient.invalidateQueries();
      toast.success("Backup imported");
      pendoTrack("data_imported", { file_size_bytes: file.size });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Import failed — is this a valid backup file?",
      );
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Download a JSON backup of all your data, or restore one. Restoring
        merges by record, so re-importing the same file is safe.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export data
        </Button>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
        >
          {importing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Import data
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
          }}
        />
      </div>
    </div>
  );
}
