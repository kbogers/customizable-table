import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
} from '@tanstack/react-table';
import type { SortingState, Column, Header, ColumnOrderState, VisibilityState, ColumnSizingState, GroupingState } from '@tanstack/react-table';
import type { Order, Request } from './mockData';

const columnHelper = createColumnHelper<Order>();

// Column definitions with readable names and grouping
interface ColumnConfigItem {
    key: keyof Order;
    label: string;
    group: 'core' | 'customer' | 'patient' | 'planning' | 'order_data' | 'order_dates';
    defaultVisible: boolean;
}

const columnConfig: ColumnConfigItem[] = [
    // Core fields (visible by default)
    { key: 'requestId', label: 'Request #', group: 'core', defaultVisible: true },
    { key: 'order_number', label: 'Order #', group: 'core', defaultVisible: true },
    { key: 'order_status', label: 'Order Status', group: 'core', defaultVisible: true },
    { key: 'quantity', label: 'Quantity', group: 'core', defaultVisible: true },
    { key: 'weeks_ordered', label: 'Weeks Ordered', group: 'core', defaultVisible: true },

    // Customer fields (hidden by default)
    { key: 'customer_order_number', label: 'Customer Order #', group: 'customer', defaultVisible: false },
    { key: 'customer_party_id', label: 'Customer Party ID', group: 'customer', defaultVisible: false },
    { key: 'customer_party_name', label: 'Customer Party Name', group: 'customer', defaultVisible: false },
    { key: 'customer_party_address', label: 'Customer Party Address', group: 'customer', defaultVisible: false },

    // Patient fields (hidden by default)
    { key: 'eap_dossier_number', label: 'EAP Dossier Number', group: 'patient', defaultVisible: false },
    { key: 'eap_dossier_approval_status', label: 'EAP Approval Status', group: 'patient', defaultVisible: false },
    { key: 'eap_dossier_date_of_approval', label: 'EAP Approval Date', group: 'patient', defaultVisible: false },

    // Order planning fields (hidden by default)
    { key: 'order_reminder_date', label: 'Order Reminder Date', group: 'planning', defaultVisible: false },
    { key: 'next_order_expected_date', label: 'Next Order Expected Date', group: 'planning', defaultVisible: false },

    // Order data fields (some visible, some hidden)
    { key: 'status_updated_at', label: 'Status Updated At', group: 'order_data', defaultVisible: false },
    { key: 'order_tracking_number', label: 'Tracking Number', group: 'order_data', defaultVisible: false },
    { key: 'shipment_order_number', label: 'Shipment Order #', group: 'order_data', defaultVisible: false },

    // Order dates (hidden by default)
    { key: 'order_received_on', label: 'Order Received On', group: 'order_dates', defaultVisible: false },
    { key: 'order_created_on', label: 'Order Created On', group: 'order_dates', defaultVisible: false },
    { key: 'order_approved_on', label: 'Order Approved On', group: 'order_dates', defaultVisible: false },
    { key: 'order_shipped_on', label: 'Order Shipped On', group: 'order_dates', defaultVisible: false },
    { key: 'order_delivered_on', label: 'Order Delivered On', group: 'order_dates', defaultVisible: false },
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
    customer: 'Customer data',
    patient: 'Patient data',
    planning: 'Order planning',
    order_data: 'Order data',
    order_dates: 'Order dates',
};

// Truncated cell component with tooltip
const TruncatedCell: React.FC<{ 
    value: string | number | null | undefined; 
    className?: string;
    emptyPlaceholder?: boolean;
}> = ({ value, className = '', emptyPlaceholder = false }) => {
    if (value === null || value === undefined || value === '') {
        return emptyPlaceholder ? <span className="text-gray-400">—</span> : null;
    }
    return (
        <span className={`block truncate ${className}`} title={String(value)}>
            {value}
        </span>
    );
};

// Chip component with truncation
const ChipCell: React.FC<{ 
    value: string; 
    variant: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
}> = ({ value, variant }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
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

const getStatusVariant = (status: string): 'green' | 'blue' | 'gray' | 'yellow' | 'red' => {
    switch (status) {
        case 'Delivered':
            return 'green';
        case 'Shipped':
            return 'blue';
        case 'Approved':
            return 'green';
        case 'Pending':
            return 'yellow';
        case 'On Hold':
            return 'gray';
        case 'Cancelled':
            return 'red';
        default:
            return 'gray';
    }
};

const getEAPStatusVariant = (status: string): 'green' | 'blue' | 'gray' | 'yellow' | 'red' => {
    switch (status) {
        case 'Approved':
            return 'green';
        case 'Pending':
            return 'yellow';
        case 'Under Review':
            return 'blue';
        case 'Rejected':
            return 'red';
        default:
            return 'gray';
    }
};

const columns = [
    // Core columns
    columnHelper.accessor('requestId', {
        header: 'Request #',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-medium text-gray-900" />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_number', {
        header: 'Order #',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-medium text-gray-900" />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_status', {
        header: 'Order Status',
        cell: (info) => <ChipCell value={info.getValue()} variant={getStatusVariant(info.getValue())} />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 100,
        minSize: 80,
    }),
    columnHelper.accessor('weeks_ordered', {
        header: 'Weeks Ordered',
        cell: (info) => <TruncatedCell value={info.getValue()} />,
        size: 120,
        minSize: 100,
    }),

    // Customer columns
    columnHelper.accessor('customer_order_number', {
        header: 'Customer Order #',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 160,
        minSize: 120,
    }),
    columnHelper.accessor('customer_party_id', {
        header: 'Customer Party ID',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 150,
        minSize: 120,
    }),
    columnHelper.accessor('customer_party_name', {
        header: 'Customer Party Name',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 200,
        minSize: 150,
    }),
    columnHelper.accessor('customer_party_address', {
        header: 'Customer Party Address',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 250,
        minSize: 200,
    }),

    // Patient columns
    columnHelper.accessor('eap_dossier_number', {
        header: 'EAP Dossier Number',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 160,
        minSize: 120,
    }),
    columnHelper.accessor('eap_dossier_approval_status', {
        header: 'EAP Approval Status',
        cell: (info) => <ChipCell value={info.getValue()} variant={getEAPStatusVariant(info.getValue())} />,
        size: 160,
        minSize: 120,
    }),
    columnHelper.accessor('eap_dossier_date_of_approval', {
        header: 'EAP Approval Date',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),

    // Order planning columns
    columnHelper.accessor('order_reminder_date', {
        header: 'Order Reminder Date',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 160,
        minSize: 120,
    }),
    columnHelper.accessor('next_order_expected_date', {
        header: 'Next Order Expected Date',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 180,
        minSize: 150,
    }),

    // Order data columns
    columnHelper.accessor('status_updated_at', {
        header: 'Status Updated At',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_tracking_number', {
        header: 'Tracking Number',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 150,
        minSize: 120,
    }),
    columnHelper.accessor('shipment_order_number', {
        header: 'Shipment Order #',
        cell: (info) => <TruncatedCell value={info.getValue()} className="font-mono text-sm" emptyPlaceholder />,
        size: 150,
        minSize: 120,
    }),

    // Order dates columns
    columnHelper.accessor('order_received_on', {
        header: 'Order Received On',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_created_on', {
        header: 'Order Created On',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_approved_on', {
        header: 'Order Approved On',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_shipped_on', {
        header: 'Order Shipped On',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor('order_delivered_on', {
        header: 'Order Delivered On',
        cell: (info) => <TruncatedCell value={info.getValue()} emptyPlaceholder />,
        size: 140,
        minSize: 100,
    }),
];

// Icons (reusing from Table.tsx)
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

const ChevronRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

const GroupIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// Column Menu Component
interface ColumnMenuProps {
    column: Column<Order, unknown>;
    allColumns: Column<Order, unknown>[];
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
    columns: Column<Order, unknown>[];
    hiddenCount: number;
    isGroupedByRequest?: boolean;
    onToggleGroupByRequest?: () => void;
}

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({ columns, hiddenCount: _hiddenCount, isGroupedByRequest, onToggleGroupByRequest }) => {
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
        const groups: Record<string, Column<Order, unknown>[]> = {
            core: [],
            customer: [],
            patient: [],
            planning: [],
            order_data: [],
            order_dates: [],
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
                    {/* Group by Request toggle */}
                    {onToggleGroupByRequest && (
                        <>
                            <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between"
                                onClick={onToggleGroupByRequest}
                            >
                                <span className="flex items-center gap-2">
                                    <GroupIcon />
                                    Group by Request
                                </span>
                                <span className={`w-8 h-5 rounded-full relative transition-colors ${isGroupedByRequest ? 'bg-[#007c50]' : 'bg-gray-300'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isGroupedByRequest ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                </span>
                            </button>
                            <div className="h-px bg-gray-200 my-1" />
                        </>
                    )}
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
    header: Header<Order, unknown>;
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
    allColumns: Column<Order, unknown>[];
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

interface OrdersTableProps {
    data: Order[];
    requests?: Request[];
    onRowClick?: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ data, requests = [], onRowClick }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(getDefaultVisibility);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
        columns.map(col => col.accessorKey as string)
    );
    const [grouping, setGrouping] = useState<GroupingState>([]);
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

    // Build a lookup map from requestId to request for group headers
    const requestMap = useMemo(() => {
        const map: Record<string, Request> = {};
        requests.forEach(req => { map[req.requestId] = req; });
        return map;
    }, [requests]);

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

    const [expanded, setExpanded] = useState<true | Record<string, boolean>>(true);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            columnOrder: displayOrder,
            columnSizing,
            grouping,
            expanded,
        },
        onExpandedChange: setExpanded,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing,
        onGroupingChange: setGrouping,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        enableGrouping: true,
    });

    const hiddenColumnCount = Object.values(columnVisibility).filter(v => v === false).length;

    // Check if table has been modified from defaults
    const defaultColumnOrder = columns.map(col => col.accessorKey as string);
    const defaultVisibility = getDefaultVisibility();
    
    const _isModified = 
        sorting.length > 0 ||
        JSON.stringify(columnOrder) !== JSON.stringify(defaultColumnOrder) ||
        JSON.stringify(columnVisibility) !== JSON.stringify(defaultVisibility) ||
        grouping.length > 0;

    const handleReset = () => {
        setSorting([]);
        setColumnOrder(defaultColumnOrder);
        setColumnVisibility(defaultVisibility);
        setColumnSizing({});
        setGrouping([]);
        setHasInitializedSizing(false);
    };

    const toggleGroupByRequest = () => {
        if (grouping.includes('requestId')) {
            setGrouping([]);
        } else {
            setGrouping(['requestId']);
        }
    };

    const isGroupedByRequest = grouping.includes('requestId');

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
                            <option value="delivered">Status: Delivered</option>
                            <option value="shipped">Status: Shipped</option>
                            <option value="pending">Status: Pending</option>
                            <option value="cancelled">Status: Cancelled</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDownIcon />
                        </div>
                    </div>

                    {/* Columns dropdown */}
                    <ColumnVisibilityDropdown
                        columns={table.getAllLeafColumns()}
                        hiddenCount={hiddenColumnCount}
                        isGroupedByRequest={isGroupedByRequest}
                        onToggleGroupByRequest={toggleGroupByRequest}
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
                            placeholder="Search for orders"
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
                        {table.getRowModel().rows.map((row) => {
                            if (row.getIsGrouped()) {
                                // Group header row
                                const visibleColumnCount = table.getAllLeafColumns().filter(col => col.getIsVisible()).length;
                                const requestId = String(row.groupingValue);
                                const request = requestMap[requestId];
                                return (
                                    <tr key={row.id} className="bg-gray-50 hover:bg-gray-100 border-t border-gray-200">
                                        <td
                                            colSpan={visibleColumnCount}
                                            className="px-4 py-2.5 text-sm text-gray-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={row.getToggleExpandedHandler()}
                                                    className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                                                >
                                                    {row.getIsExpanded() ? (
                                                        <ChevronDownIcon />
                                                    ) : (
                                                        <ChevronRightIcon />
                                                    )}
                                                </button>
                                                <span className="font-semibold">
                                                    {requestId}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {row.subRows.length} {row.subRows.length === 1 ? 'order' : 'orders'}
                                                </span>
                                                {request && (
                                                    <span className="flex items-center gap-3 ml-3 text-xs text-gray-400">
                                                        <span className="truncate max-w-[140px]" title={request.physician}>{request.physician}</span>
                                                        <span className="text-gray-300">·</span>
                                                        <span className="truncate max-w-[160px]" title={request.institution}>{request.institution}</span>
                                                        <span className="text-gray-300">·</span>
                                                        <span>{request.country}</span>
                                                        <span className="text-gray-300">·</span>
                                                        <span className="text-gray-500 font-medium">{request.phase}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                            
                            // Regular data row (only show if parent is expanded or not grouped)
                            if (row.getParentRow() && !row.getParentRow()?.getIsExpanded()) {
                                return null;
                            }
                            
                            // Only make rows clickable if they have original data and onRowClick is provided
                            const orderData = row.original as Order | undefined;
                            const isClickable = onRowClick && orderData;
                            
                            return (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-gray-50 group/row ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={(e) => {
                                        if (!isClickable) return;
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onRowClick(orderData);
                                    }}
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
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
