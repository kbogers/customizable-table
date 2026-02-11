import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
} from '@tanstack/react-table';
import type { SortingState, Column, Header, ColumnOrderState, VisibilityState, ColumnSizingState } from '@tanstack/react-table';
import type { Request } from './mockData';

const columnHelper = createColumnHelper<Request>();

// Column definitions with readable names and grouping
interface ColumnConfigItem {
    key: keyof Request;
    label: string;
    group: 'core' | 'details' | 'identifiers' | 'physician';
    defaultVisible: boolean;
}

const columnConfig: ColumnConfigItem[] = [
    // Core fields (visible by default)
    { key: 'requestId', label: 'Request #', group: 'core', defaultVisible: true },
    { key: 'physician', label: 'Physician', group: 'core', defaultVisible: true },
    { key: 'institution', label: 'Institution', group: 'core', defaultVisible: true },
    { key: 'country', label: 'Country', group: 'core', defaultVisible: true },
    { key: 'owner', label: 'Owner', group: 'core', defaultVisible: true },
    { key: 'phase', label: 'Phase', group: 'core', defaultVisible: true },
    { key: 'comments', label: 'Comments', group: 'core', defaultVisible: true },

    // Details fields (hidden by default)
    { key: 'product', label: 'Product', group: 'details', defaultVisible: false },
    { key: 'requestType', label: 'Request type', group: 'details', defaultVisible: false },
    { key: 'fundingModel', label: 'Funding model', group: 'details', defaultVisible: false },
    { key: 'receivedOn', label: 'Received on', group: 'details', defaultVisible: false },
    { key: 'rationale', label: 'Rationale', group: 'details', defaultVisible: false },

    // Identifiers (hidden by default)
    { key: 'patientInitials', label: 'Patient initials', group: 'identifiers', defaultVisible: false },
    { key: 'patientNumber', label: 'Patient number', group: 'identifiers', defaultVisible: false },
    { key: 'castorId', label: 'Castor ID', group: 'identifiers', defaultVisible: false },
    { key: 'eapDossierNumber', label: 'EAP dossier number', group: 'identifiers', defaultVisible: false },

    // Physician details (hidden by default)
    { key: 'physicianEmail', label: 'Physician email', group: 'physician', defaultVisible: false },
    { key: 'physicianFirstName', label: 'Physician first name', group: 'physician', defaultVisible: false },
    { key: 'physicianLastName', label: 'Physician last name', group: 'physician', defaultVisible: false },
    { key: 'physicianPhone', label: 'Phone number', group: 'physician', defaultVisible: false },
    { key: 'physicianSpecialty', label: 'Specialty', group: 'physician', defaultVisible: false },
];

const getColumnLabel = (columnId: string): string => {
    const config = columnConfig.find(c => c.key === columnId);
    return config?.label || columnId;
};

const getDefaultVisibility = (): VisibilityState => {
    const visibility: VisibilityState = {};
    columnConfig.forEach(col => {
        if (!col.defaultVisible) {
            visibility[col.key] = false;
        }
    });
    return visibility;
};

const groupLabels: Record<string, string> = {
    core: 'Core fields',
    details: 'Request details',
    identifiers: 'Identifiers',
    physician: 'Physician details',
};

// Truncated cell component with tooltip
const TruncatedCell: React.FC<{ 
    value: string | null | undefined; 
    className?: string;
    emptyPlaceholder?: boolean;
}> = ({ value, className = '', emptyPlaceholder = false }) => {
    if (!value) {
        return emptyPlaceholder ? <span className="text-gray-400">—</span> : null;
    }
    return (
        <span className={`block truncate ${className}`} title={value}>
            {value}
        </span>
    );
};

// Chip component with truncation
const ChipCell: React.FC<{ 
    value: string; 
    variant: 'green' | 'blue' | 'gray';
}> = ({ value, variant }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };
    return (
        <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium max-w-full ${colorClasses[variant]}`}
            title={value}
        >
            <span className="truncate">{value}</span>
        </span>
    );
};

const columns = [
    // Core columns
    columnHelper.accessor('requestId', {
        header: 'Request #',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-medium text-gray-900" />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('physician', {
        header: 'Physician',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 180,
        minSize: 100,
    }),
    columnHelper.accessor('institution', {
        header: 'Institution',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 220,
        minSize: 120,
    }),
    columnHelper.accessor('country', {
        header: 'Country',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('owner', {
        header: 'Owner',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 180,
        minSize: 100,
    }),
    columnHelper.accessor('phase', {
        header: 'Phase',
        cell: (info) => <ChipCell value={info.getValue()} variant="gray" />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('comments', {
        header: 'Comments',
        cell: (info) => <TruncatedCell value={info.getValue()} className="text-blue-500 cursor-pointer hover:underline" />,
        size: 200,
        minSize: 100,
    }),

    // Details columns
    columnHelper.accessor('product', {
        header: 'Product',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 160,
        minSize: 100,
    }),
    columnHelper.accessor('requestType', {
        header: 'Request type',
        cell: (info) => <ChipCell value={info.getValue()} variant="green" />,
        size: 160,
        minSize: 120,
    }),
    columnHelper.accessor('fundingModel', {
        header: 'Funding model',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('receivedOn', {
        header: 'Received on',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 120,
        minSize: 100,
    }),
    columnHelper.accessor('rationale', {
        header: 'Rationale',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 280,
        minSize: 150,
    }),

    // Identifiers columns
    columnHelper.accessor('patientInitials', {
        header: 'Patient initials',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 120,
        minSize: 80,
    }),
    columnHelper.accessor('patientNumber', {
        header: 'Patient number',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('castorId', {
        header: 'Castor ID',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 120,
        minSize: 80,
    }),
    columnHelper.accessor('eapDossierNumber', {
        header: 'EAP dossier number',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 160,
        minSize: 100,
    }),

    // Physician details columns
    columnHelper.accessor('physicianEmail', {
        header: 'Physician email',
        cell: (info) => {
            const val = info.getValue();
            return (
                <a href={`mailto:${val}`} className="block truncate text-blue-600 hover:underline" title={val}>
                    {val}
                </a>
            );
        },
        size: 220,
        minSize: 150,
    }),
    columnHelper.accessor('physicianFirstName', {
        header: 'First name',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 120,
        minSize: 80,
    }),
    columnHelper.accessor('physicianLastName', {
        header: 'Last name',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 120,
        minSize: 80,
    }),
    columnHelper.accessor('physicianPhone', {
        header: 'Phone number',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono" />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('physicianSpecialty', {
        header: 'Specialty',
        cell: (info) => <ChipCell value={info.getValue()} variant="blue" />,
        size: 140,
        minSize: 100,
    }),
];

// Icons as components
const SortAscIcon = () => (
    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-5 5m5-5l5 5" />
    </svg>
);

const SortDescIcon = () => (
    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m0 0l5-5m-5 5l-5-5" />
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

const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const CalendarViewWeekIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
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

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({ columns, hiddenCount: _hiddenCount }) => {
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

    // Group columns by their group
    const groupedColumns = useMemo(() => {
        const groups: Record<string, Column<Request, unknown>[]> = {
            core: [],
            details: [],
            identifiers: [],
            physician: [],
        };

        columns.forEach(column => {
            const config = columnConfig.find(c => c.key === column.id);
            if (config) {
                groups[config.group].push(column);
            }
        });

        return groups;
    }, [columns]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-3 h-10 px-3 pr-2 text-[15px] font-normal text-gray-900 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-1">
                    <CalendarViewWeekIcon />
                    <span className="w-20 text-left truncate">Columns</span>
                </div>
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-[1000] min-w-[260px] max-h-[400px] overflow-y-auto">
                    {Object.entries(groupedColumns).map(([group, cols]) => (
                        <div key={group}>
                            <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                {groupLabels[group]}
                            </div>
                            {cols.map((column) => (
                                <button
                                    key={column.id}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between"
                                    onClick={() => column.toggleVisibility()}
                                >
                                    <span className={column.getIsVisible() ? '' : 'text-gray-400'}>{getColumnLabel(column.id)}</span>
                                    {column.getIsVisible() ? (
                                        <EyeIcon />
                                    ) : (
                                        <span className="text-gray-400"><EyeOffIcon /></span>
                                    )}
                                </button>
                            ))}
                        </div>
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
            className={`relative px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider select-none group transition-colors duration-75 cursor-grab active:cursor-grabbing ${isBeingDragged ? 'opacity-50 bg-blue-50 scale-[0.98]' : ''} ${showHoverState ? 'bg-gray-100' : ''} ${isPinned ? 'bg-gray-100 sticky left-0 z-10 border-r-2 border-gray-300' : ''}`}
            style={{ 
                width: header.getSize(),
            }}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex items-center gap-1">
                {/* Header content */}
                <div className="flex items-center gap-1.5 flex-1">
                    <span>
                        {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                </div>

                {/* Sort button - stops drag propagation */}
                <button
                    className={`p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition-all duration-75 flex-shrink-0 relative z-20 ${showHoverState || sortDirection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        header.column.getToggleSortingHandler()?.(e);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    draggable={false}
                >
                    {sortDirection === 'asc' ? (
                        <SortAscIcon />
                    ) : sortDirection === 'desc' ? (
                        <SortDescIcon />
                    ) : (
                        <SortNeutralIcon />
                    )}
                </button>

                {/* More options button */}
                <button
                    className={`p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition-all duration-75 flex-shrink-0 relative z-20 ${showHoverState ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(e);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    draggable={false}
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
    onRowClick?: (request: Request) => void;
}

export const Table: React.FC<TableProps> = ({ data, onRowClick }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(getDefaultVisibility);
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
    const [containerWidth, setContainerWidth] = useState(0);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const [hasInitializedSizing, setHasInitializedSizing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const toolbarPortal = document.getElementById('table-toolbar-portal');

    // Keyboard shortcut for search (⌘K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Calculate initial column sizes to fill available space
    const initializeColumnSizes = (availableWidth: number) => {
        // Get visible columns and their default sizes
        const visibleColumnConfigs = columnConfig.filter(col => col.defaultVisible);
        const defaultTotalWidth = visibleColumnConfigs.reduce((sum, col) => {
            const colDef = columns.find(c => c.accessorKey === col.key);
            return sum + (colDef?.size || 150);
        }, 0);

        // If container is wider than default columns, scale them up
        if (availableWidth > defaultTotalWidth) {
            const scaleFactor = availableWidth / defaultTotalWidth;
            const newSizing: ColumnSizingState = {};

            visibleColumnConfigs.forEach(col => {
                const colDef = columns.find(c => c.accessorKey === col.key);
                const defaultSize = colDef?.size || 150;
                const minSize = colDef?.minSize || 50;
                // Scale up but respect any practical max (3x default is reasonable)
                newSizing[col.key] = Math.max(minSize, Math.floor(defaultSize * scaleFactor));
            });

            setColumnSizing(newSizing);
        }
        setHasInitializedSizing(true);
    };

    // Measure container width for table sizing
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                setContainerWidth(width);
                
                // Initialize column sizes on first measurement
                if (!hasInitializedSizing && width > 0) {
                    initializeColumnSizes(width);
                }
            }
        });
        
        observer.observe(container);
        const initialWidth = container.clientWidth;
        setContainerWidth(initialWidth);
        
        // Initialize if we have width immediately
        if (!hasInitializedSizing && initialWidth > 0) {
            initializeColumnSizes(initialWidth);
        }
        
        return () => observer.disconnect();
    }, [hasInitializedSizing]);

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
            columnSizing,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
    });

    const hiddenColumnCount = Object.values(columnVisibility).filter(v => v === false).length;

    const defaultColumnOrder = columns.map(col => col.accessorKey as string);
    const defaultVisibility = getDefaultVisibility();

    const handleReset = () => {
        setSorting([]);
        setColumnOrder(defaultColumnOrder);
        setColumnVisibility(defaultVisibility);
        setColumnSizing({});
        setHasInitializedSizing(false);
    };

    return (
        <div className="space-y-0">
            {/* Toolbar rendered via portal into the navigation bar */}
            {toolbarPortal && createPortal(
                <>
                    {/* Status filter dropdown */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 pl-3 pr-12 text-[15px] font-normal text-gray-900 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors appearance-none cursor-pointer w-[170px]"
                        >
                            <option value="all">Status: All</option>
                            <option value="active">Status: Active</option>
                            <option value="pending">Status: Pending</option>
                            <option value="completed">Status: Completed</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDownIcon />
                        </div>
                    </div>

                    {/* Columns dropdown */}
                    <ColumnVisibilityDropdown
                        columns={table.getAllLeafColumns()}
                        hiddenCount={hiddenColumnCount}
                    />

                    {/* Search input */}
                    <div className="relative w-[280px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for requests"
                            className="h-10 w-full pl-11 pr-16 text-[15px] font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                            <kbd className="px-1.5 py-0.5 text-[15px] text-gray-500 bg-gray-100 rounded">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-[15px] text-gray-500 bg-gray-100 rounded">K</kbd>
                        </div>
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        title="Refresh"
                    >
                        <RefreshIcon />
                    </button>
                </>,
                toolbarPortal
            )}

            {/* Table */}
            <div ref={containerRef} className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
                <table
                    className="text-left border-collapse"
                    style={{ 
                        width: Math.max(table.getTotalSize(), containerWidth),
                        tableLayout: 'fixed',
                    }}
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
                            <tr
                                key={row.id}
                                className={`hover:bg-gray-50 group/row ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(row.original)}
                            >
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
