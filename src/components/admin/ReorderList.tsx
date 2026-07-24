'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Reorder, useDragControls } from 'framer-motion';

type ReorderListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  /** Called on drop with the keys in their new order. */
  onPersist: (orderedKeys: string[]) => void;
  renderRow: (item: T) => ReactNode;
  disabled?: boolean;
};

/**
 * Drag-to-reorder list. Grab a row by its handle (⠿), drag up/down, and on drop
 * the new key order is handed to onPersist. Local order updates live during the
 * drag; the parent re-syncs from server data via the items prop after saving.
 */
export function ReorderList<T>({
  items,
  getKey,
  onPersist,
  renderRow,
  disabled,
}: ReorderListProps<T>) {
  const [order, setOrder] = useState<T[]>(items);
  const orderRef = useRef<T[]>(items);

  useEffect(() => {
    setOrder(items);
    orderRef.current = items;
  }, [items]);

  function handleReorder(next: T[]) {
    setOrder(next);
    orderRef.current = next;
  }

  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={order}
      onReorder={handleReorder}
      className="admin-reorder"
    >
      {order.map((item) => (
        <ReorderRow
          key={getKey(item)}
          item={item}
          disabled={disabled}
          renderRow={renderRow}
          onCommit={() => onPersist(orderRef.current.map(getKey))}
        />
      ))}
    </Reorder.Group>
  );
}

function ReorderRow<T>({
  item,
  renderRow,
  onCommit,
  disabled,
}: {
  item: T;
  renderRow: (item: T) => ReactNode;
  onCommit: () => void;
  disabled?: boolean;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      className="admin-reorder-row"
    >
      <button
        type="button"
        className="admin-drag-handle"
        aria-label="Sürüklə"
        title="Sürüşdürərək sırala"
        disabled={disabled}
        onPointerDown={(e) => {
          if (!disabled) controls.start(e);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <g fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </g>
        </svg>
      </button>
      <div className="admin-reorder-body">{renderRow(item)}</div>
    </Reorder.Item>
  );
}
