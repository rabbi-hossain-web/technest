'use client';

import { deleteProductAction } from '@/actions/products';
import { DeleteButton } from './delete-button';

export function ProductDeleteButton({ id, name, redirectTo, iconOnly = true }: { id: string; name: string; redirectTo?: string; iconOnly?: boolean }) {
  return (
    <DeleteButton
      iconOnly={iconOnly}
      label={`Delete ${name}`}
      confirmText={`Delete “${name}”? Products with past orders are archived instead.`}
      onDelete={() => deleteProductAction(id)}
      redirectTo={redirectTo}
    />
  );
}
