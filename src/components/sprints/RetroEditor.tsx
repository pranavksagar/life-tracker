import { useEffect, useState } from "react";
import type { Sprint } from "@/data";
import { useSprintMutations } from "@/hooks/useSprints";
import { pendoTrack } from "@/lib/pendo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Retro / notes for a sprint, saved explicitly so typing isn't chatty. */
export function RetroEditor({ sprint }: { sprint: Sprint }) {
  const { update } = useSprintMutations();
  const [value, setValue] = useState(sprint.retro_notes ?? "");

  useEffect(() => {
    setValue(sprint.retro_notes ?? "");
  }, [sprint.id, sprint.retro_notes]);

  const dirty = value !== (sprint.retro_notes ?? "");

  return (
    <div className="space-y-2">
      <Textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What went well? What would you change next sprint?"
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!dirty || update.isPending}
          onClick={() => {
            const trimmed = value.trim() || null;
            update.mutate(
              { id: sprint.id, patch: { retro_notes: trimmed } },
              {
                onSuccess: () => {
                  pendoTrack("sprint_retro_saved", {
                    sprint_id: sprint.id,
                    sprint_status: sprint.status,
                    retro_length: trimmed?.length ?? 0,
                  });
                },
              },
            );
          }}
        >
          Save notes
        </Button>
      </div>
    </div>
  );
}
