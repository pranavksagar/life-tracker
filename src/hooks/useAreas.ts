import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { areasRepo } from "@/data";
import type { Area, AreaPatch, NewArea } from "@/data";
import { pendoTrack } from "@/lib/pendo";
import { qk } from "@/lib/query-keys";

export function useAreas(options?: { includeArchived?: boolean }) {
  return useQuery({
    queryKey: [...qk.areas, options?.includeArchived ?? false],
    queryFn: () => areasRepo.list(options),
  });
}

/** Lookup map id → area for fast rendering. */
export function useAreaMap(): Map<string, Area> {
  const { data } = useAreas({ includeArchived: true });
  return new Map((data ?? []).map((a) => [a.id, a]));
}

export function useAreaMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qk.areas });

  const create = useMutation({
    mutationFn: (input: NewArea) => areasRepo.create(input),
    onSuccess: (area) => {
      invalidate();
      toast.success("Area created");
      pendoTrack("area_created", { color: area.color });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not create area"),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AreaPatch }) =>
      areasRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not update area"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => areasRepo.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Area deleted");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not delete area"),
  });

  return { create, update, remove };
}
