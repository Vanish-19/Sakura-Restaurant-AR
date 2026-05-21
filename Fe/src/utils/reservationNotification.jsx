import { Button } from 'antd';
import NotificationProgress from '../components/atoms/NotificationProgress.jsx';

export function showReservationNotification(api, {
  type = 'success',
  message,
  description,
  duration = 4.5,
  actionLabel,
  onAction,
}) {
  const notify = api?.[type] || api?.success;
  if (!notify) return;

  notify({
    message,
    description: (
      <div>
        <div>{description}</div>
        {actionLabel && onAction ? (
          <Button
            size="small"
            type="primary"
            className="mt-3 !h-8 !rounded-lg !bg-[#d8001e] !px-3 !text-xs !font-semibold !text-white hover:!bg-[#b60018]"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
        <NotificationProgress duration={duration} />
      </div>
    ),
    duration,
    placement: 'topRight',
  });
}
