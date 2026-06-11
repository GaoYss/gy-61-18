import { Activity, AlertTriangle, MapPin } from "lucide-react";

import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/format";

function getStatusPriority(status) {
  return status === "offline" ? 0 : 1;
}

export function DeviceManagement({ data }) {
  const sortedDevices = [...data.devices].sort((a, b) => {
    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;
    return a.device_code.localeCompare(b.device_code);
  });

  return (
    <section className="view-stack">
      <header className="page-header">
        <div>
          <h1>门禁设备管理</h1>
          <p>查看各出入口设备状态、安装位置和最近心跳时间。</p>
        </div>
      </header>

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
        {!data.devices.length && <EmptyState />}
      </div>
    </section>
  );
}
