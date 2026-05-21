import NotificationProgress from '../components/atoms/NotificationProgress.jsx';

export function showReservationNotification(api, { type = 'success', message, description, duration = 4.5 }) {
  const notify = api?.[type] || api?.success;
  if (!notify) return;

  notify({
    message,
    description: (
      <div>
        <div>{description}</div>
        <NotificationProgress duration={duration} />
      </div>
    ),
    duration,
    placement: 'topRight',
  });
}
