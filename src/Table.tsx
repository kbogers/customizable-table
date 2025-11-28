import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
} from '@tanstack/react-table';
import type { SortingState, Column, Header, ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import type { Request } from './mockData';

const columnHelper = createColumnHelper<Request>();

// Column definitions with readable names
const columnConfig: { key: keyof Request; label: string }[] = [
    { key: 'requestId', label: 'Request #' },
    { key: 'physician', label: 'Physician' },
    { key: 'institution', label: 'Institution' },
    { key: 'country', label: 'Country' },
    { key: 'owner', label: 'Owner' },
    { key: 'phase', label: 'Phase' },
    { key: 'comments', label: 'Comments' },
];

const getColumnLabel = (columnId: string): string => {
    const config = columnConfig.find(c => c.key === columnId);
    return config?.label || columnId;
};

const columns = [
    columnHelper.accessor('requestId', {
        header: 'Request #',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('physician', {
        header: 'Physician',
        cell: (info) => info.getValue(),
        size: 180,
        minSize: 100,
    }),
    columnHelper.accessor('institution', {
        header: 'Institution',
        cell: (info) => <span className="truncate max-w-[200px] block" title={info.getValue()}>{info.getValue()}</span>,
        size: 220,
        minSize: 120,
    }),
    columnHelper.accessor('country', {
        header: 'Country',
        cell: (info) => info.getValue(),
        size: 100,
        minSize: 70,
    }),
    columnHelper.accessor('owner', {
        header: 'Owner',
        cell: (info) => info.getValue(),
        size: 180,
        minSize: 100,
    }),
    columnHelper.accessor('phase', {
        header: 'Phase',
        cell: (info) => (
            <span className="phase-chip">
                {info.getValue()}
            </span>
        ),
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('comments', {
        header: 'Comments',
        cell: (info) => {
            const val = info.getValue();
            return val ? <span className="text-blue-500 cursor-pointer hover:underline truncate max-w-[200px] block" title={val}>{val}</span> : null;
        },
        size: 200,
        minSize: 100,
    }),
];

// Icons as components
const SortAscIcon = () => (
    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
);

const SortDescIcon = () => (
    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
);

const SortNeutralIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
);

const MoreOptionsIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

const DragHandleIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="10" r="1.5" />
        <circle cx="15" cy="10" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
        <circle cx="15" cy="15" r="1.5" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="15" cy="20" r="1.5" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const PinIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4V2m0 2l3.5 3.5M16 4l-4 4m8.5-.5L17 11l-1.5 5.5L12 20l-3.5-3.5m0 0L5 20l3.5-3.5m0 0L5 13l5.5-1.5L14 8" />
    </svg>
);

const UnpinIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4V2m0 2l3.5 3.5M16 4l-4 4m8.5-.5L17 11l-1.5 5.5L12 20l-3.5-3.5m0 0L5 20l3.5-3.5m0 0L5 13l5.5-1.5L14 8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4l16 16" />
    </svg>
);

const FilterIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

// Column Menu Component
interface ColumnMenuProps {
    column: Column<Request, unknown>;
    allColumns: Column<Request, unknown>[];
    onClose: () => void;
    position: { top: number; left: number };
}

const ColumnMenu: React.FC<ColumnMenuProps> = ({ column, allColumns, onClose, position }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const isPinned = column.getIsPinned();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handlePin = () => {
        // Unpin all other columns first
        allColumns.forEach(col => {
            if (col.getIsPinned()) {
                col.pin(false);
            }
        });
        // Pin this column
        column.pin('left');
        onClose();
    };

    return createPortal(
        <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[1000] min-w-[180px]"
            style={{ top: position.top, left: position.left }}
        >
            <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                    // Filter functionality placeholder
                    console.log('Filter by:', column.id);
                    onClose();
                }}
            >
                <FilterIcon />
                Filter by {getColumnLabel(column.id)}
            </button>
            {isPinned ? (
                <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                        column.pin(false);
                        onClose();
                    }}
                >
                    <UnpinIcon />
                    Unpin column
                </button>
            ) : (
                <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                    onClick={handlePin}
                >
                    <PinIcon />
                    Pin to left
                </button>
            )}
            <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                    column.toggleVisibility(false);
                    onClose();
                }}
            >
                <EyeOffIcon />
                Hide column
            </button>
        </div>,
        document.body
    );
};

// Column Visibility Dropdown
interface ColumnVisibilityDropdownProps {
    columns: Column<Request, unknown>[];
    hiddenCount: number;
}

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({ columns, hiddenCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (hiddenCount === 0) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md transition-colors duration-75"
            >
                {hiddenCount} column{hiddenCount !== 1 ? 's' : ''} hidden
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[1000] min-w-[200px]">
                    {columns.map((column) => (
                        <button
                            key={column.id}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between"
                            onClick={() => column.toggleVisibility()}
                        >
                            <span>{getColumnLabel(column.id)}</span>
                            {column.getIsVisible() ? (
                                <EyeIcon />
                            ) : (
                                <EyeOffIcon />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Drag state context to share between header cells
interface DragState {
    draggedColumnId: string | null;
    targetColumnId: string | null;
    dropPosition: 'left' | 'right' | null;
}

// Calculate preview order based on drag state
const calculatePreviewOrder = (
    currentOrder: ColumnOrderState,
    draggedColumnId: string | null,
    targetColumnId: string | null,
    dropPosition: 'left' | 'right' | null
): ColumnOrderState => {
    if (!draggedColumnId || !targetColumnId || !dropPosition) {
        return currentOrder;
    }

    if (draggedColumnId === targetColumnId) {
        return currentOrder;
    }

    const newOrder = [...currentOrder];
    const draggedIndex = newOrder.indexOf(draggedColumnId);
    
    // Remove dragged column
    newOrder.splice(draggedIndex, 1);
    
    // Find new target index (after removal)
    let targetIndex = newOrder.indexOf(targetColumnId);
    if (dropPosition === 'right') {
        targetIndex += 1;
    }
    
    // Insert at new position
    newOrder.splice(targetIndex, 0, draggedColumnId);
    
    return newOrder;
};

// Header Cell Component
interface HeaderCellProps {
    header: Header<Request, unknown>;
    columnOrder: ColumnOrderState;
    setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
    dragState: DragState;
    setDragState: React.Dispatch<React.SetStateAction<DragState>>;
    isAnyResizing: boolean;
    setIsAnyResizing: React.Dispatch<React.SetStateAction<boolean>>;
    previewOrder: ColumnOrderState;
    isDragging: boolean;
    resizingColumnId: string | null;
    setResizingColumnId: React.Dispatch<React.SetStateAction<string | null>>;
    allColumns: Column<Request, unknown>[];
}

const HeaderCell: React.FC<HeaderCellProps> = ({ 
    header, 
    columnOrder, 
    setColumnOrder, 
    dragState, 
    setDragState, 
    isAnyResizing, 
    setIsAnyResizing,
    previewOrder,
    isDragging: isTableDragging,
    resizingColumnId,
    setResizingColumnId,
    allColumns
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const headerRef = useRef<HTMLTableCellElement>(null);
    
    const isBeingDragged = dragState.draggedColumnId === header.column.id;
    
    // Only show hover state if not resizing any column and not dragging (unless this column is being dragged)
    const showHoverState = isHovered && !isAnyResizing && (!isTableDragging || isBeingDragged);
    
    // Show resize handle if hovered, or if this column is being resized
    const showResizeHandle = showHoverState || resizingColumnId === header.column.id;

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', header.column.id);
        e.dataTransfer.effectAllowed = 'move';
        setDragState(prev => ({ ...prev, draggedColumnId: header.column.id }));
        
        // Create a custom drag image
        const dragImage = document.createElement('div');
        dragImage.textContent = String(header.column.columnDef.header);
        dragImage.style.cssText = 'position: absolute; top: -1000px; padding: 8px 12px; background: #3b82f6; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    const handleDragEnd = () => {
        // Commit the preview order as the actual order
        if (dragState.draggedColumnId && dragState.targetColumnId && dragState.dropPosition) {
            setColumnOrder(previewOrder);
        }
        setDragState({ draggedColumnId: null, targetColumnId: null, dropPosition: null });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!headerRef.current || dragState.draggedColumnId === header.column.id) {
            return;
        }

        const rect = headerRef.current.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        const position: 'left' | 'right' = e.clientX < midpoint ? 'left' : 'right';

        // Only update if something changed to avoid unnecessary re-renders
        if (dragState.targetColumnId !== header.column.id || dragState.dropPosition !== position) {
            setDragState(prev => ({
                ...prev,
                targetColumnId: header.column.id,
                dropPosition: position,
            }));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        // The actual reordering happens in handleDragEnd
    };

    const sortDirection = header.column.getIsSorted();

    const isPinned = header.column.getIsPinned();

    return (
        <th
            ref={headerRef}
            className={`relative px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider select-none group transition-colors duration-75 ${isBeingDragged ? 'opacity-50 bg-blue-50 scale-[0.98]' : ''} ${showHoverState ? 'bg-gray-100' : ''} ${isPinned ? 'bg-gray-100 sticky left-0 z-10 border-r-2 border-gray-300' : ''}`}
            style={{ 
                width: header.getSize(),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Drag handle - absolutely positioned */}
            <div
                className={`absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-opacity duration-75 z-10 ${showHoverState ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <DragHandleIcon />
            </div>

            <div className="flex items-center gap-1">
                {/* Header content with sorting - shifts right on hover */}
                <div
                    className={`flex items-center gap-1.5 cursor-pointer flex-1 transition-transform duration-100 ease-out ${showHoverState ? 'translate-x-5' : 'translate-x-0'}`}
                    onClick={header.column.getToggleSortingHandler()}
                >
                    <span>
                        {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    {/* Sorting indicator */}
                    <span className="flex-shrink-0">
                        {sortDirection === 'asc' ? (
                            <SortAscIcon />
                        ) : sortDirection === 'desc' ? (
                            <SortDescIcon />
                        ) : (
                            <span className={`transition-opacity duration-75 ${showHoverState ? 'opacity-100' : 'opacity-0'}`}>
                                <SortNeutralIcon />
                            </span>
                        )}
                    </span>
                </div>

                {/* More options button */}
                <button
                    className={`p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition-all duration-75 flex-shrink-0 relative z-20 ${showHoverState ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={handleMenuClick}
                >
                    <MoreOptionsIcon />
                </button>
            </div>

            {/* Column menu */}
            {menuPosition && (
                <ColumnMenu
                    column={header.column}
                    allColumns={allColumns}
                    onClose={() => setMenuPosition(null)}
                    position={menuPosition}
                />
            )}

            {/* Resize handle */}
            <div
                className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-all duration-75 ${showResizeHandle ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${resizingColumnId === header.column.id ? 'bg-blue-500' : 'bg-gray-300 hover:bg-blue-500'}`}
                onMouseDown={(e) => {
                    setIsAnyResizing(true);
                    setResizingColumnId(header.column.id);
                    const resizeHandler = header.getResizeHandler();
                    resizeHandler(e);
                    
                    const handleMouseUp = () => {
                        setIsAnyResizing(false);
                        setResizingColumnId(null);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mouseup', handleMouseUp);
                }}
                onTouchStart={(e) => {
                    setIsAnyResizing(true);
                    setResizingColumnId(header.column.id);
                    const resizeHandler = header.getResizeHandler();
                    resizeHandler(e);
                    
                    const handleTouchEnd = () => {
                        setIsAnyResizing(false);
                        setResizingColumnId(null);
                        document.removeEventListener('touchend', handleTouchEnd);
                    };
                    document.addEventListener('touchend', handleTouchEnd);
                }}
            />
        </th>
    );
};

interface TableProps {
    data: Request[];
}

export const Table: React.FC<TableProps> = ({ data }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
        columns.map(col => col.accessorKey as string)
    );
    const [dragState, setDragState] = useState<DragState>({
        draggedColumnId: null,
        targetColumnId: null,
        dropPosition: null,
    });
    const [isAnyResizing, setIsAnyResizing] = useState(false);
    const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);

    // Calculate preview order based on current drag state
    const previewOrder = useMemo(() => {
        return calculatePreviewOrder(
            columnOrder,
            dragState.draggedColumnId,
            dragState.targetColumnId,
            dragState.dropPosition
        );
    }, [columnOrder, dragState.draggedColumnId, dragState.targetColumnId, dragState.dropPosition]);

    const isDragging = dragState.draggedColumnId !== null;

    // Use preview order when dragging, otherwise use actual order
    const displayOrder = isDragging ? previewOrder : columnOrder;

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            columnOrder: displayOrder,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
    });

    const hiddenColumnCount = Object.values(columnVisibility).filter(v => v === false).length;

    return (
        <div className="space-y-3">
            {/* Toolbar with column visibility dropdown */}
            <div className="flex items-center justify-between">
                <ColumnVisibilityDropdown
                    columns={table.getAllLeafColumns()}
                    hiddenCount={hiddenColumnCount}
                />
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table
                    className="w-full text-left border-collapse"
                    style={{ width: table.getCenterTotalSize() }}
                >
                    <thead className="bg-gray-50 border-b border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <HeaderCell
                                        key={header.id}
                                        header={header}
                                        columnOrder={columnOrder}
                                        setColumnOrder={setColumnOrder}
                                        dragState={dragState}
                                        setDragState={setDragState}
                                        isAnyResizing={isAnyResizing}
                                        setIsAnyResizing={setIsAnyResizing}
                                        previewOrder={previewOrder}
                                        isDragging={isDragging}
                                        resizingColumnId={resizingColumnId}
                                        setResizingColumnId={setResizingColumnId}
                                        allColumns={table.getAllLeafColumns()}
                                    />
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 group/row">
                                {row.getVisibleCells().map((cell) => {
                                    const isPinned = cell.column.getIsPinned();
                                    return (
                                        <td
                                            key={cell.id}
                                            className={`px-4 py-4 text-sm text-gray-600 whitespace-nowrap ${
                                                dragState.draggedColumnId === cell.column.id ? 'opacity-50 bg-blue-50' : ''
                                            } ${isPinned ? 'bg-white sticky left-0 z-10 border-r-2 border-gray-300 group-hover/row:bg-gray-50' : ''}`}
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
