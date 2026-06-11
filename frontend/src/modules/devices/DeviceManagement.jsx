import { Activity, AlertTriangle, Loader2, MapPin, RefreshCw } from "lucide-react";

import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/format";

function getStatusPriority(status) {
  return status === "offline" ? 0 : 1;
}

export function DeviceManagement({ data }) {
  const { devices, offlineDeviceCount, lastUpdated, refresh, refreshing, loading, error } = data;

  const sortedDevices = [...devices].sort((a, b) => {
    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;
    return a.device_code.localeCompare(b.device_code);
  });

  if (loading) return <section className="panel">数据加载中...</section>;
  if (error) return <section className="panel error-panel">{error}</section>;

  return (
    <section className="view-stack">
      <header className="page-header">
        <div>
          <h1>门禁设备管理</h1>
          <p>查看各出入口设备状态、安装位置和最近心跳时间。</p>
        </div>
      </header>

      <div className="device-status-bar">
        <div className={`offline-count-card ${offlineDeviceCount > 0 ? "has-offline" : ""}`}>
          <AlertTriangle size={20} />
          <div>
            <span className="offline-label">离线设备</span>
            <strong className="offline-number">{offlineDeviceCount}</strong>
            <span className="offline-unit">台</span>
          </div>
        </div>
        <div className="refresh-info">
          {lastUpdated && (
            <span className="last-updated">
              {refreshing && <Loader2 size={14} className="icon-spin" />}
              {!refreshing && `最后更新：${formatDateTime(lastUpdated)}`}
              {refreshing && " 正在刷新..."}
            </span>
          )}
          <button
            className="refresh-btn"
            onClick={refresh}
            disabled={refreshing || loading}
            title="手动刷新"
          >
            <RefreshCw size={16} className={refreshing ? "icon-spin" : ""} />
            {refreshing ? "刷新中..." : "刷新"}
          </button>
        </div>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>设备编号</th>
              <th>设备名称</th>
              <th>位置</th>
              <th>状态</th>
              <th>最近心跳</th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device) => (
              <tr key={device.id} className={device.status === "offline" ? "device-offline-row" : ""}>
                <td>{device.device_code}</td>
                <td>
                  {device.status === "offline" && <AlertTriangle size={15} className="offline-icon" />}
                  {device.status !== "offline" && <Activity size={15} />}
                  {device.name}
                </td>
                <td><MapPin size={15} />{device.location}</td>
                <td><StatusBadge value={device.status} label={device.status_display} /></td>
                <td>{formatDateTime(device.last_heartbeat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!devices.length && <EmptyState />}
      </div>
    </section>
  );
}
