import { Progress } from 'antd';
import { useEffect, useState } from 'react';

export default function NotificationProgress({ duration = 4.5 }) {
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    const startedAt = Date.now();
    const totalMs = duration * 1000;
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setPercent(Math.max(0, 100 - (elapsed / totalMs) * 100));
    }, 80);

    return () => window.clearInterval(timer);
  }, [duration]);

  return (
    <Progress
      percent={percent}
      showInfo={false}
      strokeColor="#8B0000"
      trailColor="#f3d7dc"
      size="small"
      className="reservation-notification-progress"
    />
  );
}
