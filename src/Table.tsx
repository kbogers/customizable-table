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
import { phases, requestTypes, fundingModels } from './mockData';

const columnHelper = createColumnHelper<Request>();

// Column definitions with readable names and grouping
interface ColumnConfigItem {
    key: keyof Request;
    label: string;
    group: 'core' | 'details' | 'identifiers' | 'physician';
    defaultVisible: boolean;
    editable: boolean;
    editorType?: 'text' | 'select' | 'textarea';
    options?: readonly string[];
}

const columnConfig: ColumnConfigItem[] = [
    // Core fields (visible by default)
    { key: 'requestId', label: 'Request #', group: 'core', defaultVisible: true, editable: false },
    { key: 'physician', label: 'Physician', group: 'core', defaultVisible: true, editable: false },
    { key: 'institution', label: 'Institution', group: 'core', defaultVisible: true, editable: false },
    { key: 'country', label: 'Country', group: 'core', defaultVisible: true, editable: false },
    { key: 'owner', label: 'Owner', group: 'core', defaultVisible: true, editable: true, editorType: 'text' },
    { key: 'phase', label: 'Phase', group: 'core', defaultVisible: true, editable: true, editorType: 'select', options: phases },
    { key: 'comments', label: 'Comments', group: 'core', defaultVisible: true, editable: true, editorType: 'textarea' },

    // Details fields (hidden by default)
    { key: 'product', label: 'Product', group: 'details', defaultVisible: false, editable: true, editorType: 'text' },
    { key: 'requestType', label: 'Request type', group: 'details', defaultVisible: false, editable: true, editorType: 'select', options: requestTypes },
    { key: 'fundingModel', label: 'Funding model', group: 'details', defaultVisible: false, editable: true, editorType: 'select', options: fundingModels },
    { key: 'receivedOn', label: 'Received on', group: 'details', defaultVisible: false, editable: false },
    { key: 'rationale', label: 'Rationale', group: 'details', defaultVisible: false, editable: true, editorType: 'textarea' },

    // Identifiers (hidden by default)
    { key: 'patientInitials', label: 'Patient initials', group: 'identifiers', defaultVisible: false, editable: true, editorType: 'text' },
    { key: 'patientNumber', label: 'Patient number', group: 'identifiers', defaultVisible: false, editable: false },
    { key: 'castorId', label: 'Castor ID', group: 'identifiers', defaultVisible: false, editable: true, editorType: 'text' },
    { key: 'eapDossierNumber', label: 'EAP dossier number', group: 'identifiers', defaultVisible: false, editable: false },

    // Physician details (hidden by default)
    { key: 'physicianEmail', label: 'Physician email', group: 'physician', defaultVisible: false, editable: false },
    { key: 'physicianFirstName', label: 'Physician first name', group: 'physician', defaultVisible: false, editable: false },
    { key: 'physicianLastName', label: 'Physician last name', group: 'physician', defaultVisible: false, editable: false },
    { key: 'physicianPhone', label: 'Phone number', group: 'physician', defaultVisible: false, editable: false },
    { key: 'physicianSpecialty', label: 'Specialty', group: 'physician', defaultVisible: false, editable: false },
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

const XIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CalendarViewWeekIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
);

// Inline editing icons
const PencilIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const InlineCheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
);

const InlineCancelIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Inline Editor Component
interface InlineEditorProps {
    value: string;
    onChange: (value: string) => void;
    editorType: 'text' | 'select' | 'textarea';
    options?: readonly string[];
    onSave: (value: string) => void;
    onCancel: () => void;
}

const InlineEditor: React.FC<InlineEditorProps> = ({
    value,
    onChange,
    editorType,
    options,
    onSave,
    onCancel,
}) => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
    const savedRef = useRef(false);

    useEffect(() => {
        const el = inputRef.current;
        if (el) {
            el.focus();
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.select();
            }
        }
    }, []);

    const doSave = (val: string) => {
        if (savedRef.current) return;
        savedRef.current = true;
        onSave(val);
    };

    const doCancel = () => {
        if (savedRef.current) return;
        savedRef.current = true;
        onCancel();
    };

    const getCurrentValue = () => {
        const el = inputRef.current;
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
            return el.value;
        }
        return value;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSave(getCurrentValue());
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            doCancel();
        }
    };

    const handleBlur = () => {
        doSave(getCurrentValue());
    };

    const btnBase = "p-1 rounded shrink-0 transition-colors";

    if (editorType === 'select') {
        return (
            <div className="flex items-center gap-1" data-inline-editor>
                <select
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                    value={value}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        onChange(newVal);
                        doSave(newVal);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="flex-1 min-w-0 px-1 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => doSave(getCurrentValue())}
                    className={`${btnBase} hover:bg-green-100 text-green-600`}
                    title="Save (Enter)"
                >
                    <InlineCheckIcon />
                </button>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => doCancel()}
                    className={`${btnBase} hover:bg-red-100 text-red-500`}
                    title="Cancel (Esc)"
                >
                    <InlineCancelIcon />
                </button>
            </div>
        );
    }

    if (editorType === 'textarea') {
        return (
            <div
                className="absolute top-0 left-0 w-full min-w-[280px] bg-white rounded-md shadow-lg ring-2 ring-[#007c50] z-30"
                data-inline-editor
                onClick={(e) => e.stopPropagation()}
            >
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            doSave(getCurrentValue());
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            doCancel();
                        }
                    }}
                    onBlur={handleBlur}
                    className="w-full px-2 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 resize-none rounded-t-md"
                    rows={4}
                />
                <div className="flex justify-end gap-1 px-1 pb-1">
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => doSave(getCurrentValue())}
                        className={`${btnBase} hover:bg-green-100 text-green-600`}
                        title="Save (⌘Enter)"
                    >
                        <InlineCheckIcon />
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => doCancel()}
                        className={`${btnBase} hover:bg-red-100 text-red-500`}
                        title="Cancel (Esc)"
                    >
                        <InlineCancelIcon />
                    </button>
                </div>
            </div>
        );
    }

    // Default: text input
    return (
        <div className="flex items-center gap-1" data-inline-editor>
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="flex-1 min-w-0 px-1 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
            />
            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => doSave(getCurrentValue())}
                className={`${btnBase} hover:bg-green-100 text-green-600`}
                title="Save (Enter)"
            >
                <InlineCheckIcon />
            </button>
            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => doCancel()}
                className={`${btnBase} hover:bg-red-100 text-red-500`}
                title="Cancel (Esc)"
            >
                <InlineCancelIcon />
            </button>
        </div>
    );
};

// Owner Filter Component
interface OwnerFilterProps {
    data: Request[];
    selectedOwners: Set<string>;
    onSelectionChange: (selected: Set<string>) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

const OwnerFilter: React.FC<OwnerFilterProps> = ({ 
    data, 
    selectedOwners, 
    onSelectionChange, 
    onClose,
    position 
}) => {
    const filterRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Get unique owners from data
    const uniqueOwners = useMemo(() => {
        const owners = new Set<string>();
        data.forEach(item => {
            if (item.owner) {
                owners.add(item.owner);
            }
        });
        return Array.from(owners).sort();
    }, [data]);

    // Filter owners based on search query
    const filteredOwners = useMemo(() => {
        if (!searchQuery.trim()) {
            return uniqueOwners;
        }
        const query = searchQuery.toLowerCase();
        return uniqueOwners.filter(owner => 
            owner.toLowerCase().includes(query)
        );
    }, [uniqueOwners, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        // Focus search input when filter opens
        searchInputRef.current?.focus();
    }, []);

    const handleToggleOwner = (owner: string) => {
        const newSelection = new Set(selectedOwners);
        if (newSelection.has(owner)) {
            newSelection.delete(owner);
        } else {
            newSelection.add(owner);
        }
        onSelectionChange(newSelection);
    };

    const handleClearAll = () => {
        onSelectionChange(new Set());
    };

    return createPortal(
        <div
            ref={filterRef}
            className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-[1000] w-[320px] max-h-[400px] flex flex-col"
            style={{ top: position.top, left: position.left }}
        >
            {/* Search bar */}
            <div className="p-3 border-b border-gray-200">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Clear all button */}
            {selectedOwners.size > 0 && (
                <div className="px-3 py-2 border-b border-gray-200 flex justify-end">
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Owner list */}
            <div className="overflow-y-auto flex-1 py-2">
                {filteredOwners.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No owners found
                    </div>
                ) : (
                    <div className="px-2">
                        {filteredOwners.map((owner) => {
                            const isSelected = selectedOwners.has(owner);
                            return (
                                <label
                                    key={owner}
                                    className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleOwner(owner)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="text-sm text-gray-900 flex-1">{owner}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

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
    onReset: () => void;
}

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({ columns, hiddenCount: _hiddenCount, onReset }) => {
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

    const handleResetClick = () => {
        onReset();
        setIsOpen(false);
    };

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
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] min-w-[260px] max-h-[400px] flex flex-col">
                    {/* Scrollable column groups area */}
                    <div className="overflow-y-auto py-2">
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
                    {/* Fixed reset view button at the bottom */}
                    <div className="border-t border-gray-200">
                        <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2"
                            onClick={handleResetClick}
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset view
                        </button>
                    </div>
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

// Custom Tooltip Component with short delay
interface TooltipProps {
    text: string;
    children: React.ReactElement<{ onMouseEnter?: (e: React.MouseEvent) => void; onMouseLeave?: (e: React.MouseEvent) => void; onMouseMove?: (e: React.MouseEvent) => void }>;
    delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, delay = 200 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const elementRef = useRef<HTMLElement | null>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        const element = e.currentTarget as HTMLElement;
        elementRef.current = element;
        
        timeoutRef.current = setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 6,
                left: rect.left + rect.width / 2,
            });
            setIsMounted(true);
            // Trigger fade-in after mount
            setTimeout(() => setIsVisible(true), 10);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
        // Wait for fade-out before unmounting
        setTimeout(() => {
            setIsMounted(false);
            setPosition(null);
        }, 100);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Update position on mouse move to keep tooltip aligned
    const handleMouseMove = (_e: React.MouseEvent) => {
        if (isMounted && elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 6,
                left: rect.left + rect.width / 2,
            });
        }
    };

    return (
        <>
            {React.cloneElement(children, {
                onMouseEnter: (e: React.MouseEvent) => {
                    handleMouseEnter(e);
                    children.props.onMouseEnter?.(e);
                },
                onMouseLeave: (e: React.MouseEvent) => {
                    handleMouseLeave();
                    children.props.onMouseLeave?.(e);
                },
                onMouseMove: (e: React.MouseEvent) => {
                    handleMouseMove(e);
                    children.props.onMouseMove?.(e);
                },
            })}
            {isMounted && position && createPortal(
                <div
                    className="fixed z-[2000] pointer-events-none"
                    style={{
                        top: position.top,
                        left: position.left,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className={`bg-gray-900 text-white text-xs px-2 py-1.5 rounded shadow-lg whitespace-nowrap transition-opacity duration-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        {text}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
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
    ownerFilterActive: boolean;
    data: Request[];
    selectedOwners: Set<string>;
    onOwnerSelectionChange: (selected: Set<string>) => void;
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
    allColumns,
    ownerFilterActive,
    data,
    selectedOwners,
    onOwnerSelectionChange
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [filterPosition, setFilterPosition] = useState<{ top: number; left: number } | null>(null);
    const headerRef = useRef<HTMLTableCellElement>(null);
    
    const isBeingDragged = dragState.draggedColumnId === header.column.id;
    const isOwnerColumn = header.column.id === 'owner';
    
    // Only show hover state if not resizing any column and not dragging (unless this column is being dragged)
    const showHoverState = isHovered && !isAnyResizing && (!isTableDragging || isBeingDragged);
    
    // Show resize handle if hovered, or if this column is being resized
    const showResizeHandle = showHoverState || resizingColumnId === header.column.id;

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    };

    const handleFilterButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setFilterPosition({ top: rect.bottom + 4, left: rect.left });
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
                    
                    {/* Filter button - stops drag propagation */}
                    {isOwnerColumn && (
                        <Tooltip
                            text={`Click to filter rows by ${getColumnLabel(header.column.id)}`}
                        >
                            <button
                                className={`p-1 rounded transition-all duration-75 flex-shrink-0 relative z-20 ${
                                    ownerFilterActive 
                                        ? 'opacity-100 bg-blue-500 text-white hover:bg-blue-600' 
                                        : showHoverState 
                                            ? 'opacity-100 hover:bg-gray-200 active:bg-gray-300' 
                                            : 'opacity-0 pointer-events-none'
                                }`}
                                onClick={handleFilterButtonClick}
                                onMouseDown={(e) => e.stopPropagation()}
                                draggable={false}
                            >
                                <FilterIcon />
                            </button>
                        </Tooltip>
                    )}

                    {/* Sort button - stops drag propagation */}
                    <Tooltip
                        text={
                            sortDirection === 'asc' 
                                ? `Sorted ascending - Click to sort descending by ${getColumnLabel(header.column.id)}`
                                : sortDirection === 'desc'
                                ? `Sorted descending - Click to remove sort`
                                : `Sort by ${getColumnLabel(header.column.id)}`
                        }
                    >
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
                    </Tooltip>
                </div>

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

            {/* Owner filter dropdown */}
            {isOwnerColumn && filterPosition && (
                <OwnerFilter
                    data={data}
                    selectedOwners={selectedOwners}
                    onSelectionChange={onOwnerSelectionChange}
                    onClose={() => setFilterPosition(null)}
                    position={filterPosition}
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
    onCellClick?: (request: Request, field: keyof Request) => void;
    onCellSave?: (requestId: string, field: keyof Request, value: string) => void;
}

export const Table: React.FC<TableProps> = ({ data, onRowClick, onCellClick, onCellSave }) => {
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
    const [selectedOwners, setSelectedOwners] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
    const [editValue, setEditValue] = useState('');
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

    // Apply owner filter to data
    const filteredData = useMemo(() => {
        if (selectedOwners.size === 0) {
            return data;
        }
        return data.filter(item => selectedOwners.has(item.owner));
    }, [data, selectedOwners]);

    // Count active filter types (not the number of selected items within each filter)
    const activeFilterCount = (selectedOwners.size > 0 ? 1 : 0);

    const table = useReactTable({
        data: filteredData,
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

    // Reset view settings (column width, order, visibility, sorting) - does not reset filters
    const handleReset = () => {
        setSorting([]);
        setColumnOrder(defaultColumnOrder);
        setColumnVisibility(defaultVisibility);
        setColumnSizing({});
        setHasInitializedSizing(false);
    };

    // Clear all filters
    const handleClearAllFilters = () => {
        setSelectedOwners(new Set());
    };

    return (
        <div className="space-y-0">
            {/* Toolbar rendered via portal into the navigation bar */}
            {toolbarPortal && createPortal(
                <>
                    {/* Active filters indicator */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleClearAllFilters}
                            className="h-10 px-3 text-[15px] font-normal text-gray-900 hover:text-gray-700 flex items-center gap-2"
                        >
                            <span>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
                            <XIcon />
                        </button>
                    )}

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
                        onReset={handleReset}
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
                                        ownerFilterActive={selectedOwners.size > 0}
                                        data={data}
                                        selectedOwners={selectedOwners}
                                        onOwnerSelectionChange={setSelectedOwners}
                                    />
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="group/row">
                                {row.getVisibleCells().map((cell) => {
                                    const isPinned = cell.column.getIsPinned();
                                    const columnId = cell.column.id;
                                    const config = columnConfig.find(c => c.key === columnId);
                                    const isEditable = config?.editable ?? false;
                                    const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === columnId;
                                    const isTextarea = config?.editorType === 'textarea';

                                    return (
                                        <td
                                            key={cell.id}
                                            className={`relative text-sm text-gray-600 ${
                                                isEditing && !isTextarea
                                                    ? 'whitespace-nowrap px-2 py-1 bg-white ring-2 ring-[#007c50] ring-inset z-20 rounded-sm'
                                                    : `whitespace-nowrap px-4 py-4 group/cell cursor-pointer hover:bg-gray-100 ${
                                                        isPinned ? 'bg-white sticky left-0 z-10 border-r-2 border-gray-300' : ''
                                                    }`
                                            } ${
                                                !isEditing && dragState.draggedColumnId === cell.column.id ? 'opacity-50 bg-blue-50' : ''
                                            }`}
                                            style={{ width: cell.column.getSize() }}
                                            onClick={() => {
                                                if (isEditing) return;
                                                if (onCellClick) {
                                                    onCellClick(row.original, columnId as keyof Request);
                                                } else if (onRowClick) {
                                                    onRowClick(row.original);
                                                }
                                            }}
                                        >
                                            {isEditing && !isTextarea ? (
                                                <InlineEditor
                                                    value={editValue}
                                                    onChange={setEditValue}
                                                    editorType={config?.editorType || 'text'}
                                                    options={config?.options}
                                                    onSave={(val) => {
                                                        onCellSave?.(row.original.requestId, columnId as keyof Request, val);
                                                        setEditingCell(null);
                                                        setEditValue('');
                                                    }}
                                                    onCancel={() => {
                                                        setEditingCell(null);
                                                        setEditValue('');
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    {isEditing && isTextarea && (
                                                        <InlineEditor
                                                            value={editValue}
                                                            onChange={setEditValue}
                                                            editorType="textarea"
                                                            onSave={(val) => {
                                                                onCellSave?.(row.original.requestId, columnId as keyof Request, val);
                                                                setEditingCell(null);
                                                                setEditValue('');
                                                            }}
                                                            onCancel={() => {
                                                                setEditingCell(null);
                                                                setEditValue('');
                                                            }}
                                                        />
                                                    )}
                                                    {!isEditing && isEditable && (
                                                        <button
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded bg-gray-200/80 text-gray-500 hover:text-gray-700 hover:bg-gray-300 opacity-0 group-hover/cell:opacity-100 transition-opacity z-10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingCell({ rowId: row.id, columnId });
                                                                setEditValue(String(row.original[columnId as keyof Request] ?? ''));
                                                            }}
                                                        >
                                                            <PencilIcon />
                                                        </button>
                                                    )}
                                                </>
                                            )}
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
