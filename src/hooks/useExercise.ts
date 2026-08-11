import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { exerciseRepo } from "@/data";
import type { ExerciseLogPatch, NewExerciseLog } from "@/data";
import { pendoTrack } from "@/lib/pendo";
import { qk, qkRoots } from "@/lib/query-keys";

export interface ExerciseFilter {
  from?: string;
  to?: string;
  areaId?: string;
}

export function useExercise(filter: ExerciseFilter = {}) {
  return useQuery({
    queryKey: qk.exercise(filter),
    queryFn: () => exerciseRepo.list(filter),
  });
}

export function useExerciseMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qkRoots.exercise });

  const create = useMutation({
    mutationFn: (input: NewExerciseLog) => exerciseRepo.create(input),
    onSuccess: (log) => {
      invalidate();
      toast.success("Workout logged");
      pendoTrack("exercise_logged", {
        exercise_type: log.type,
        duration_min: log.duration_min,
        intensity: log.intensity,
        has_calories: log.calories != null,
        has_area: log.area_id != null,
      });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not log workout"),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ExerciseLogPatch }) =>
      exerciseRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not update workout"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => exerciseRepo.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Entry deleted");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not delete entry"),
  });

  return { create, update, remove };
}
