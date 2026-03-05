import React from 'react';
import type { Request, Order } from './mockData';
import { requestTypes, fundingModels, specialties, durationUnits, formatDuration } from './mockData';

interface DetailsPanelProps {
  request: Request | null;
  orders: Order[];
  initialOrder?: Order | null;
  initialView?: 'request' | 'order';
  focusField?: keyof Request | null;
  onClose: () => void;
  onSave?: (updatedRequest: Request) => void;
  onSaveOrder?: (updatedOrder: Order) => void;
  onCreateOrder?: (newOrder: Order) => void;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MoreVertIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);


const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);


const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowBackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const KinaxisAvatar = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[9px] font-bold text-white leading-none shrink-0">
    K
  </span>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </svg>
);

const ArticleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Order Details View Component - rendered as overlay on top of request panel
interface OrderDetailsViewProps {
  order: Order;
  request: Request;
  onBack: () => void;
  onSave?: (updatedOrder: Order) => void;
  isClosing?: boolean;
}

const StatusChip: React.FC<{ status: Order['order_status'] }> = ({ status }) => {
  const colorMap: Record<Order['order_status'], { bg: string; text: string }> = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
    'Approved': { bg: 'bg-blue-50', text: 'text-blue-700' },
    'Shipped': { bg: 'bg-purple-50', text: 'text-purple-700' },
    'Delivered': { bg: 'bg-green-50', text: 'text-green-700' },
    'Cancelled': { bg: 'bg-red-50', text: 'text-red-700' },
    'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700' },
  };
  const colors = colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {status}
    </span>
  );
};

const ReadOnlyField: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
  <div className={`flex items-baseline justify-between py-1.5 ${className || ''}`}>
    <span className="text-sm text-[#666967] shrink-0">{label}</span>
    <span className="text-sm font-medium text-[#012d20] text-right">{value || '—'}</span>
  </div>
);

const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const DurationField: React.FC<{
  label: string;
  durationValue: number;
  durationUnit: Order['order_duration_unit'];
  onSave: (value: number, unit: Order['order_duration_unit']) => void;
}> = ({ label, durationValue, durationUnit, onSave }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(durationValue));
  const [editUnit, setEditUnit] = React.useState<Order['order_duration_unit']>(durationUnit);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setEditValue(String(durationValue));
    setEditUnit(durationUnit);
  }, [durationValue, durationUnit]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const num = parseInt(editValue, 10);
    if (!isNaN(num) && num > 0 && (num !== durationValue || editUnit !== durationUnit)) {
      onSave(num, editUnit);
    } else {
      // Revert on invalid input
      setEditValue(String(durationValue));
      setEditUnit(durationUnit);
    }
  };

  const handleCancel = () => {
    setEditValue(String(durationValue));
    setEditUnit(durationUnit);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Only save when focus leaves the entire container (not when moving between input ↔ select)
  const handleContainerBlur = (e: React.FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#666967] shrink-0">{label}</span>
        <div ref={containerRef} className="flex items-center gap-1.5" onBlur={handleContainerBlur}>
          <input
            ref={inputRef}
            type="number"
            min="1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 px-2 py-0.5 text-sm font-medium text-[#012d20] text-right border border-[#919392] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
          />
          <select
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value as Order['order_duration_unit'])}
            onKeyDown={handleKeyDown}
            className="px-2 py-0.5 text-sm font-medium text-[#012d20] border border-[#919392] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
          >
            {durationUnits.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="group/edit flex items-center justify-between py-1.5">
      <span className="text-sm text-[#666967] shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded hover:bg-gray-100 text-[#919392] opacity-0 group-hover/edit:opacity-100 transition-opacity"
          title="Edit"
        >
          <PencilIcon />
        </button>
        <span className="text-sm font-medium text-[#012d20] text-right">
          {formatDuration(durationValue, durationUnit)}
        </span>
      </div>
    </div>
  );
};

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, request: _request, onBack, onSave, isClosing = false }) => {
  // _request is part of the interface but not used in this view
  const [notes, setNotes] = React.useState(order.notes || '');

  React.useEffect(() => {
    setNotes(order.notes || '');
  }, [order]);

  const hasNotesChanged = notes !== (order.notes || '');

  const handleSaveNotes = () => {
    if (onSave) {
      onSave({ ...order, notes });
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[500px] bg-white shadow-[0px_4px_28px_0px_rgba(0,0,0,0.15)] z-[60] flex flex-col ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200 h-16 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowBackIcon />
          </button>
          <h2 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
            {order.order_number}
          </h2>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertIcon />
          </button>
        </div>
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Status + Source row */}
        <div className="flex items-center gap-2 mb-5">
          <StatusChip status={order.order_status} />
          {order.source === 'kinaxis' && (
            <span className="inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full bg-[#f3f4f3] text-[11px] text-[#666967]">
              <KinaxisAvatar />
              Kinaxis
            </span>
          )}
        </div>

        {/* Order Details */}
        <div className="divide-y divide-gray-100">
          <ReadOnlyField label="Quantity" value={order.quantity} />
          <DurationField
            label="Duration"
            durationValue={order.order_duration_value}
            durationUnit={order.order_duration_unit}
            onSave={(value, unit) => {
              if (onSave) {
                onSave({ ...order, order_duration_value: value, order_duration_unit: unit });
              }
            }}
          />
          <ReadOnlyField label="Order number" value={order.order_number} />
          <ReadOnlyField label="Tracking number" value={order.order_tracking_number} />
          <ReadOnlyField label="Shipment order #" value={order.shipment_order_number} />
        </div>

        {/* Customer section */}
        <h3 className="text-sm font-semibold text-[#012d20] mt-5 mb-2">Customer</h3>
        <div className="divide-y divide-gray-100">
          <ReadOnlyField label="Customer order #" value={order.customer_order_number} />
          <ReadOnlyField label="Party ID" value={order.customer_party_id} />
          <ReadOnlyField label="Party name" value={order.customer_party_name} />
          <ReadOnlyField label="Address" value={order.customer_party_address} />
        </div>

        {/* Patient section */}
        <h3 className="text-sm font-semibold text-[#012d20] mt-5 mb-2">Patient</h3>
        <div className="divide-y divide-gray-100">
          <ReadOnlyField label="EAP dossier #" value={order.eap_dossier_number} />
          <ReadOnlyField label="Approval status" value={order.eap_dossier_approval_status} />
          <ReadOnlyField label="Approval date" value={order.eap_dossier_date_of_approval} />
        </div>

        {/* Dates section */}
        <h3 className="text-sm font-semibold text-[#012d20] mt-5 mb-2">Dates</h3>
        <div className="divide-y divide-gray-100">
          <ReadOnlyField label="Received" value={order.order_received_on} />
          <ReadOnlyField label="Created" value={order.order_created_on} />
          <ReadOnlyField label="Approved" value={order.order_approved_on} />
          <ReadOnlyField label="Shipped" value={order.order_shipped_on} />
          <ReadOnlyField label="Delivered" value={order.order_delivered_on} />
          <ReadOnlyField label="Status updated" value={order.status_updated_at} />
        </div>

        {/* Planning section */}
        <h3 className="text-sm font-semibold text-[#012d20] mt-5 mb-2">Planning</h3>
        <div className="divide-y divide-gray-100">
          <ReadOnlyField label="Reminder date" value={order.order_reminder_date} />
          <ReadOnlyField label="Next order expected" value={order.next_order_expected_date} />
        </div>

        {/* Notes section - editable */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#012d20]">Notes</h3>
            {hasNotesChanged && (
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 text-xs font-semibold text-white bg-[#007c50] hover:bg-[#006640] rounded-lg transition-colors"
              >
                Save
              </button>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this order..."
            className="w-full px-3 py-2 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] resize-none whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

type Tab = 'phases' | 'details' | 'orders' | 'documents' | 'comments';
type PanelView = 'request' | 'order';

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  request,
  orders,
  initialOrder = null,
  initialView = 'request',
  focusField = null,
  onClose,
  onSave,
  onSaveOrder,
  onCreateOrder: _onCreateOrder
}) => {
  // _onCreateOrder is part of the interface but not used in the new design
  const [activeTab, setActiveTab] = React.useState<Tab>('details');
  const [panelView, setPanelView] = React.useState<PanelView>(initialView);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(initialOrder);
  const [formData, setFormData] = React.useState<Request | null>(null);
  // Track whether the order panel is animating out
  const [isOrderClosing, setIsOrderClosing] = React.useState(false);
  // Track if the request panel has already been shown (to avoid re-animating)
  const [hasAnimatedIn, setHasAnimatedIn] = React.useState(false);

  // Update panel view and selected order when initial props change
  React.useEffect(() => {
    if (initialOrder) {
      setSelectedOrder(initialOrder);
      setPanelView(initialView);
      setActiveTab('orders'); // Switch to orders tab when opening with an order
    }
  }, [initialOrder, initialView]);

  // Keep selectedOrder in sync when orders data changes (e.g. after inline edits)
  React.useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.order_number === selectedOrder.order_number);
      if (updated && updated !== selectedOrder) {
        setSelectedOrder(updated);
      }
    }
  }, [orders, selectedOrder]);

  // Mark that the request panel has animated in after initial mount
  React.useEffect(() => {
    if (request) {
      const timer = setTimeout(() => setHasAnimatedIn(true), 310);
      return () => clearTimeout(timer);
    }
  }, [request]);

  // Initialize form data when request changes
  React.useEffect(() => {
    if (request) {
      setFormData({ ...request });
    }
  }, [request]);

  // Focus the specified field when panel opens or focusField changes
  React.useEffect(() => {
    if (focusField && request) {
      setActiveTab('details');
      // Delay to allow the tab to render
      const timer = setTimeout(() => {
        const el = document.querySelector(`[data-field="${focusField}"]`) as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [focusField, request]);

  // Get orders for this request, sorted by date (latest first)
  const requestOrders = React.useMemo(() => {
    if (!request) return [];
    return orders
      .filter(order => order.requestId === request.requestId)
      .sort((a, b) => {
        // Sort by order_created_on, latest first
        // Date format is "DD MMM YYYY" (e.g., "18 Nov 2025")
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split(' ');
          const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          return new Date(`${year}-${monthMap[month] || '01'}-${day.padStart(2, '0')}`);
        };
        const dateA = parseDate(a.order_created_on);
        const dateB = parseDate(b.order_created_on);
        return dateB.getTime() - dateA.getTime();
      });
  }, [request, orders]);

  // Get latest order for planning dates
  const latestOrder = requestOrders[0] || null;

  if (!request || !formData) return null;

  // Handle closing the order panel with slide-out animation
  const handleOrderBack = () => {
    setIsOrderClosing(true);
    // Wait for the slide-out animation to finish before removing the order panel
    setTimeout(() => {
      setPanelView('request');
      setSelectedOrder(null);
      setIsOrderClosing(false);
    }, 300);
  };

  // Whether we should show the order overlay
  const showOrderOverlay = (panelView === 'order' && selectedOrder) || isOrderClosing;

  const handleFieldChange = <K extends keyof Request>(field: K, value: Request[K]) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(request);

  const handleSave = () => {
    if (formData && onSave) {
      onSave(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset to original request data
    setFormData({ ...request });
    onClose();
  };

  const handleClose = () => {
    // If there are unsaved changes, reset them before closing
    if (hasChanges) {
      setFormData({ ...request });
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Request Panel - always rendered */}
      <div className={`fixed right-0 top-0 h-full w-[500px] bg-white shadow-[0px_4px_28px_0px_rgba(0,0,0,0.15)] z-50 flex flex-col ${hasAnimatedIn ? '' : 'animate-slide-in-right'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200 h-16 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
              {request.requestId}
            </h2>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertIcon />
            </button>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('phases')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'phases'
              ? 'border-[#007c50] text-[#036240]'
              : 'border-transparent text-[#666967]'
              }`}
          >
            Phases
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'details'
              ? 'border-[#007c50] text-[#036240]'
              : 'border-transparent text-[#666967]'
              }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'orders'
              ? 'border-[#007c50] text-[#036240]'
              : 'border-transparent text-[#666967]'
              }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'documents'
              ? 'border-[#007c50] text-[#036240]'
              : 'border-transparent text-[#666967]'
              }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'comments'
              ? 'border-[#007c50] text-[#036240]'
              : 'border-transparent text-[#666967]'
              }`}
          >
            Comments
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${activeTab === 'orders' ? '' : 'p-4'}`}>
          {activeTab === 'details' && (
            <div className="flex flex-col gap-6">
              {/* Product */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Product
                </label>
                <input
                  data-field="product"
                  type="text"
                  value={formData.product || ''}
                  onChange={(e) => handleFieldChange('product', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Request type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Request type
                </label>
                <div className="relative">
                  <select
                    data-field="requestType"
                    value={formData.requestType}
                    onChange={(e) => handleFieldChange('requestType', e.target.value as Request['requestType'])}
                    className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] appearance-none focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent cursor-pointer"
                  >
                    {requestTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Funding model */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Funding model
                </label>
                <div className="relative">
                  <select
                    data-field="fundingModel"
                    value={formData.fundingModel}
                    onChange={(e) => handleFieldChange('fundingModel', e.target.value as Request['fundingModel'])}
                    className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] appearance-none focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent cursor-pointer"
                  >
                    {fundingModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Received on */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Received on
                </label>
                <div className="relative">
                  <input
                    data-field="receivedOn"
                    type="text"
                    value={formData.receivedOn}
                    onChange={(e) => handleFieldChange('receivedOn', e.target.value)}
                    placeholder="DD MMM YYYY"
                    className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <CalendarIcon />
                  </div>
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Country
                </label>
                <div className="relative">
                  <input
                    data-field="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Institution
                </label>
                <input
                  data-field="institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleFieldChange('institution', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Rationale */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Rationale
                </label>
                <textarea
                  data-field="rationale"
                  value={formData.rationale || ''}
                  onChange={(e) => handleFieldChange('rationale', e.target.value)}
                  rows={4}
                  className="min-h-[88px] px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] resize-none whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Owner */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Owner
                </label>
                <div className="relative">
                  <input
                    data-field="owner"
                    type="text"
                    value={formData.owner}
                    onChange={(e) => handleFieldChange('owner', e.target.value)}
                    className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex flex-col gap-4 pt-2">
                <div className="h-px bg-gray-200" />
                <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
                  Identifiers
                </h3>
              </div>

              {/* Patient initials */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Patient initials
                </label>
                <input
                  data-field="patientInitials"
                  type="text"
                  value={formData.patientInitials || ''}
                  onChange={(e) => handleFieldChange('patientInitials', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Patient number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Patient number
                </label>
                <input
                  data-field="patientNumber"
                  type="text"
                  value={formData.patientNumber}
                  onChange={(e) => handleFieldChange('patientNumber', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Castor ID */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Castor ID
                </label>
                <input
                  data-field="castorId"
                  type="text"
                  value={formData.castorId || ''}
                  onChange={(e) => handleFieldChange('castorId', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* EAP dossier number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  EAP dossier number
                </label>
                <input
                  data-field="eapDossierNumber"
                  type="text"
                  value={formData.eapDossierNumber || ''}
                  onChange={(e) => handleFieldChange('eapDossierNumber', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Divider */}
              <div className="flex flex-col gap-4 pt-2">
                <div className="h-px bg-gray-200" />
                <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
                  Physician details
                </h3>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Email
                </label>
                <input
                  data-field="physicianEmail"
                  type="email"
                  value={formData.physicianEmail}
                  onChange={(e) => handleFieldChange('physicianEmail', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* First name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  First name
                </label>
                <input
                  data-field="physicianFirstName"
                  type="text"
                  value={formData.physicianFirstName}
                  onChange={(e) => handleFieldChange('physicianFirstName', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Last name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Last name
                </label>
                <input
                  data-field="physicianLastName"
                  type="text"
                  value={formData.physicianLastName}
                  onChange={(e) => handleFieldChange('physicianLastName', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Phone number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Phone number
                </label>
                <input
                  data-field="physicianPhone"
                  type="tel"
                  value={formData.physicianPhone}
                  onChange={(e) => handleFieldChange('physicianPhone', e.target.value)}
                  className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
                />
              </div>

              {/* Specialty */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#012d20] pb-1">
                  Specialty
                </label>
                <div className="relative">
                  <select
                    data-field="physicianSpecialty"
                    value={formData.physicianSpecialty}
                    onChange={(e) => handleFieldChange('physicianSpecialty', e.target.value as Request['physicianSpecialty'])}
                    className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] appearance-none focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent cursor-pointer"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="text-center py-12 text-gray-500">
              Phases tab - Coming soon
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex flex-col">
              {/* Planning Section */}
              <div className="px-6 pt-4 pb-2">
                <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
                  Planning
                </h3>
              </div>
              <div className="px-6 pb-4 pt-2 flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-1 pb-1">
                    <label className="text-sm font-semibold text-[#012d20]">
                      Order reminder
                    </label>
                    <InfoIcon />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={latestOrder?.order_reminder_date || ''}
                      readOnly
                      className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-1 pb-1">
                    <label className="text-sm font-semibold text-[#012d20]">
                      Next order expected
                    </label>
                    <InfoIcon />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={latestOrder?.next_order_expected_date || ''}
                      readOnly
                      className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>
              </div>
              {/* Add note link */}
              <div className="px-6 pb-4 flex items-center gap-2">
                <ArticleIcon />
                <button className="text-sm font-medium text-[#0771d2] underline">
                  Add note
                </button>
              </div>

              {/* Orders List Section */}
              <div className="px-6 pt-4 pb-2">
                <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
                  Orders
                </h3>
              </div>

              {/* Orders List */}
              <div className="flex flex-col">
                {requestOrders.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    No orders found for this request
                  </div>
                ) : (
                  requestOrders.map((order, index) => {
                    // Map order status to display status based on order progress
                    // Open: Order created (not yet shipped)
                    // Started: Warehouse got started on the shipment (shipped but not delivered)
                    // Finished: Delivered
                    const getDisplayStatus = (): { label: string; bg: string; border: string; text: string } => {
                      if (order.order_delivered_on) {
                        return { label: 'Finished', bg: 'bg-[#d4f6e2]', border: 'border-[#a4ebc1]', text: 'text-[#036240]' };
                      } else if (order.order_shipped_on) {
                        return { label: 'Started', bg: 'bg-[#e2f1ff]', border: 'border-[#c2e2ff]', text: 'text-[#054c8f]' };
                      } else {
                        // Order created but not yet shipped -> Open
                        return { label: 'Open', bg: 'bg-[#f3edfa]', border: 'border-[#e7dbf3]', text: 'text-[#5b3573]' };
                      }
                    };

                    const displayStatus = getDisplayStatus();

                    // Determine which status badge to show based on order progress
                    // Open: "Order created [date]"
                    // Started: "Shipped [date]" + "Tracking: [number]" (if available)
                    // Finished: "Delivered [date]"
                    const getStatusBadges = () => {
                      const badges: Array<{ label: string; date: string; icon: 'check' | 'info'; isLink?: boolean }> = [];

                      if (order.order_delivered_on) {
                        // Finished: Show delivered date
                        badges.push({ label: 'Delivered', date: order.order_delivered_on, icon: 'check' });
                      } else if (order.order_shipped_on) {
                        // Started: Show shipped date
                        badges.push({ label: 'Shipped', date: order.order_shipped_on, icon: 'check' });
                        // If tracking number exists, add it as a link
                        if (order.order_tracking_number) {
                          badges.push({ label: 'Tracking', date: order.order_tracking_number, icon: 'info', isLink: true });
                        }
                      } else if (order.order_created_on) {
                        // Open: Show order created date
                        badges.push({ label: 'Order created', date: order.order_created_on, icon: 'check' });
                      }

                      return badges;
                    };

                    const statusBadges = getStatusBadges();
                    // Order numbers are displayed in reverse order (latest first, so Order 1 is the most recent)
                    const orderNumber = `Order ${requestOrders.length - index}`;

                    return (
                      <div
                        key={order.order_number}
                        className="border-t border-gray-200 bg-white px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSelectedOrder(order);
                          setPanelView('order');
                        }}
                      >
                        <div className="flex flex-col gap-4">
                          {/* Order Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-1 items-center gap-2">
                              <p className="text-sm font-medium text-[#4c504e]">
                                {orderNumber}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${displayStatus.bg} ${displayStatus.border} ${displayStatus.text}`}>
                                {displayStatus.label}
                              </span>
                            </div>
                            <ArrowRightIcon />
                          </div>

                          {/* Quantity and Duration */}
                          <div>
                            <p className="text-lg font-medium text-[#012d20] tracking-[-0.25px]">
                              {order.quantity} vials ({formatDuration(order.order_duration_value, order.order_duration_unit)})
                            </p>
                          </div>

                          {/* Status Badges */}
                          {statusBadges.length > 0 && (
                            <div className="flex gap-2 items-center flex-wrap">
                              {statusBadges.map((badge, badgeIndex) => (
                                <div
                                  key={badgeIndex}
                                  className="inline-flex items-center gap-2 h-7 px-2 py-1 bg-[#f5f6f6] rounded"
                                >
                                  {badge.icon === 'check' ? (
                                    <CheckCircleIcon />
                                  ) : (
                                    <InfoIcon />
                                  )}
                                  {badge.isLink ? (
                                    <span className="text-sm text-[#666967]">
                                      Tracking:{' '}
                                      <a
                                        href="#"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Handle tracking link click
                                        }}
                                        className="text-sm font-medium text-[#0771d2] underline"
                                      >
                                        {badge.date}
                                      </a>
                                    </span>
                                  ) : (
                                    <span className="text-sm text-[#666967]">
                                      {badge.label} {badge.date}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-12 text-gray-500">
              Documents tab - Coming soon
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="text-center py-12 text-gray-500">
              Comments tab - Coming soon
            </div>
          )}
        </div>

        {/* Footer with Save/Cancel buttons */}
        {activeTab === 'details' && (
          <div className="border-t border-gray-200 px-4 py-4 flex gap-3 justify-end shrink-0">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${hasChanges
                ? 'bg-[#007c50] hover:bg-[#006640] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Order Details Overlay - slides in/out on top of request panel */}
      {showOrderOverlay && selectedOrder && (
        <OrderDetailsView
          order={selectedOrder}
          request={request}
          onBack={handleOrderBack}
          onSave={onSaveOrder}
          isClosing={isOrderClosing}
        />
      )}
    </>
  );
};
