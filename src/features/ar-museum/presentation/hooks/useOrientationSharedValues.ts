import { useEffect, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

import { useArMuseum } from "../context/ArMuseumContext";

export type OrientationReadout = { yaw: number; pitch: number };

/** How often the textual readout (HUD numbers) re-renders. Frames move every sensor tick regardless. */
const READOUT_INTERVAL_MS = 150;

// Pipes the device orientation into Reanimated shared values, so the floating frames are animated
// on the UI thread at sensor rate without re-rendering React on every reading.
export function useOrientationSharedValues(active: boolean) {
  const { observeOrientation, isTrackingAvailable } = useArMuseum();
  const yaw = useSharedValue(0);
  const pitch = useSharedValue(0);
  const roll = useSharedValue(0);
  const [readout, setReadout] = useState<OrientationReadout | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    isTrackingAvailable()
      .then((ok) => mounted && setAvailable(ok))
      .catch(() => mounted && setAvailable(false));
    return () => {
      mounted = false;
    };
  }, [isTrackingAvailable]);

  useEffect(() => {
    if (!active) return;
    let lastReadout = 0;
    const unsubscribe = observeOrientation((o) => {
      yaw.value = o.yaw;
      pitch.value = o.pitch;
      roll.value = o.roll;
      if (o.timestamp - lastReadout >= READOUT_INTERVAL_MS) {
        lastReadout = o.timestamp;
        setReadout({ yaw: o.yaw, pitch: o.pitch });
      }
    });
    return unsubscribe;
  }, [active, observeOrientation, yaw, pitch, roll]);

  return { yaw, pitch, roll, readout, available };
}
