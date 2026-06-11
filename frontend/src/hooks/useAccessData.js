import { useCallback, useEffect, useMemo, useState } from "react";

import { accessApi } from "../api/client";

const DEFAULT_REFRESH_INTERVAL = 30000;

export function useAccessData({ refreshInterval = DEFAULT_REFRESH_INTERVAL } = {}) {
  const [state, setState] = useState({
    loading: true,
    refreshing: false,
    error: "",
    stats: null,
    devices: [],
    visitors: [],
    alarms: [],
    logs: [],
    lastUpdated: null,
  });

  const fetchData = useCallback(async (isManualRefresh = false) => {
    setState((current) => ({
      ...current,
      loading: !current.lastUpdated && !isManualRefresh,
      refreshing: !!current.lastUpdated || isManualRefresh,
      error: "",
    }));
    try {
      const [stats, devices, visitors, alarms, logs] = await Promise.all([
        accessApi.stats(),
        accessApi.devices(),
        accessApi.visitors(),
        accessApi.alarms(),
        accessApi.doorLogs(),
      ]);
      setState({
        loading: false,
        refreshing: false,
        error: "",
        stats,
        devices,
        visitors,
        alarms,
        logs,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: error.message,
      }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    async function load() {
      await fetchData();
      if (mounted && refreshInterval > 0) {
        intervalId = setInterval(() => fetchData(false), refreshInterval);
      }
    }

    load();
    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval, fetchData]);

  const offlineDeviceCount = useMemo(() => {
    return state.devices.filter((d) => d.status === "offline").length;
  }, [state.devices]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const value = useMemo(
    () => ({ ...state, offlineDeviceCount, refresh }),
    [state, offlineDeviceCount, refresh]
  );

  return value;
}
