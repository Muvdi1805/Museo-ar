import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Artwork } from "../../domain/entities/Artwork";
import { OrientationListener } from "../../domain/services/ISpatialTracker";
import { DeleteArtworkUseCase } from "../../domain/usecases/DeleteArtworkUseCase";
import { GetGalleryArtworksUseCase } from "../../domain/usecases/GetGalleryArtworksUseCase";
import { ObserveDeviceOrientationUseCase } from "../../domain/usecases/ObserveDeviceOrientationUseCase";
import { PlaceArtworkInput, PlaceArtworkUseCase } from "../../domain/usecases/PlaceArtworkUseCase";
import { RecalibrateSpatialTrackerUseCase } from "../../domain/usecases/RecalibrateSpatialTrackerUseCase";
import { ResetGalleryUseCase } from "../../domain/usecases/ResetGalleryUseCase";

type ArMuseumContextType = {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  /** Photo + texts chosen in the "add artwork" screen, waiting to be pinned in the AR view. */
  pendingDraft: PlaceArtworkInput | null;
  setPendingDraft: (draft: PlaceArtworkInput | null) => void;
  /** Pins the pending draft where the device points right now. */
  placePendingArtwork: () => Promise<Artwork | null>;
  deleteArtwork: (id: string) => Promise<boolean>;
  resetGallery: () => Promise<boolean>;
  isTrackingAvailable: () => Promise<boolean>;
  observeOrientation: (listener: OrientationListener) => () => void;
  recalibrate: () => void;
};

const ArMuseumContext = createContext<ArMuseumContextType | undefined>(undefined);

const messageOf = (e: unknown, fallback: string) => (e instanceof Error && e.message) || fallback;

export function ArMuseumProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const useCases = useMemo(
    () => ({
      place: di.resolve<PlaceArtworkUseCase>(TOKENS.PlaceArtworkUC),
      getAll: di.resolve<GetGalleryArtworksUseCase>(TOKENS.GetGalleryArtworksUC),
      remove: di.resolve<DeleteArtworkUseCase>(TOKENS.DeleteArtworkUC),
      reset: di.resolve<ResetGalleryUseCase>(TOKENS.ResetGalleryUC),
      observe: di.resolve<ObserveDeviceOrientationUseCase>(TOKENS.ObserveDeviceOrientationUC),
      recalibrate: di.resolve<RecalibrateSpatialTrackerUseCase>(TOKENS.RecalibrateSpatialTrackerUC),
    }),
    [di],
  );

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PlaceArtworkInput | null>(null);

  // Runs an action, then reloads the gallery. Returns the action's result, or null on failure.
  const run = useCallback(
    async <T,>(action: () => Promise<T>, fallback: string): Promise<T | null> => {
      setError(null);
      try {
        const result = await action();
        setArtworks(await useCases.getAll.execute());
        return result;
      } catch (e) {
        setError(messageOf(e, fallback));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useCases],
  );

  // Stable references: screens subscribe to the sensors in effects that depend on these.
  const isTrackingAvailable = useCallback(() => useCases.observe.isAvailable(), [useCases]);
  const observeOrientation = useCallback(
    (listener: OrientationListener) => useCases.observe.execute(listener),
    [useCases],
  );
  const recalibrate = useCallback(() => useCases.recalibrate.execute(), [useCases]);

  // Initial load: state is only set once the use case answers.
  useEffect(() => {
    let active = true;
    useCases.getAll
      .execute()
      .then((loaded) => active && setArtworks(loaded))
      .catch((e) => active && setError(messageOf(e, "No se pudo cargar la galería.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [useCases]);

  const value: ArMuseumContextType = {
    artworks,
    loading,
    error,
    clearError: () => setError(null),
    refresh: async () => {
      await run(async () => undefined, "No se pudo cargar la galería.");
    },
    pendingDraft,
    setPendingDraft,
    placePendingArtwork: async () => {
      if (!pendingDraft) return null;
      const placed = await run(() => useCases.place.execute(pendingDraft), "No se pudo fijar la obra.");
      if (placed) setPendingDraft(null);
      return placed;
    },
    deleteArtwork: async (id) =>
      (await run(async () => {
        await useCases.remove.execute(id);
        return true;
      }, "No se pudo eliminar la obra.")) === true,
    resetGallery: async () =>
      (await run(async () => {
        await useCases.reset.execute();
        return true;
      }, "No se pudo reiniciar la sala.")) === true,
    isTrackingAvailable,
    observeOrientation,
    recalibrate,
  };

  return <ArMuseumContext.Provider value={value}>{children}</ArMuseumContext.Provider>;
}

export function useArMuseum() {
  const ctx = useContext(ArMuseumContext);
  if (!ctx) throw new Error("useArMuseum must be used inside ArMuseumProvider");
  return ctx;
}
