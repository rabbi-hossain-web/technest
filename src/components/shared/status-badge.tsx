import { Badge, type BadgeProps } from '@/components/ui/badge';

const map: Record<string, BadgeProps['variant']> = {
  pending: 'secondary',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  paid: 'success',
  unpaid: 'warning',
  refunded: 'secondary',
  active: 'success',
  draft: 'secondary',
  archived: 'danger',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={map[status] ?? 'secondary'} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
