/**
 * Instância única do ConfirmDialog ligada ao useConfirmStore.
 * Montada uma vez no App; qualquer código chama confirmAsync().
 */

import { ConfirmDialog } from './ConfirmDialog';
import { useConfirmStore } from '../../stores/useConfirmStore';

export function GlobalConfirmDialog() {
  const open = useConfirmStore((s) => s.open);
  const options = useConfirmStore((s) => s.options);
  const settle = useConfirmStore((s) => s.settle);

  return (
    <ConfirmDialog
      open={open}
      title={options.title}
      message={options.message}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      tone={options.tone}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );
}
