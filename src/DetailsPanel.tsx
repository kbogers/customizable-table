import React from 'react';
import type { Request, Order } from './mockData';
import { requestTypes, fundingModels, specialties, orderStatuses } from './mockData';

interface DetailsPanelProps {
  request: Request | null;
  orders: Order[];
  initialOrder?: Order | null;
  initialView?: 'request' | 'order';
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

const AddIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

// Order Details View Component - rendered as overlay on top of request panel
interface OrderDetailsViewProps {
  order: Order;
  request: Request;
  onBack: () => void;
  onSave?: (updatedOrder: Order) => void;
  isClosing?: boolean;
}

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, request: _request, onBack, onSave, isClosing = false }) => {
  const [formData, setFormData] = React.useState<Order>(order);

  React.useEffect(() => {
    setFormData(order);
  }, [order]);

  const handleFieldChange = <K extends keyof Order>(field: K, value: Order[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(order);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onBack();
  };

  const handleCancel = () => {
    setFormData(order);
    onBack();
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
            onClick={handleCancel}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowBackIcon />
          </button>
          <h2 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
            {formData.order_number}
          </h2>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertIcon />
          </button>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-6">
          {/* Order Status */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Status
            </label>
            <div className="relative">
              <select
                value={formData.order_status}
                onChange={(e) => handleFieldChange('order_status', e.target.value as Order['order_status'])}
                className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] appearance-none focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent cursor-pointer"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
              className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
            />
          </div>

          {/* Weeks Ordered */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Weeks Ordered
            </label>
            <input
              type="number"
              value={formData.weeks_ordered}
              onChange={(e) => handleFieldChange('weeks_ordered', parseInt(e.target.value) || 0)}
              className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
            />
          </div>

          {/* Order Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Number
            </label>
            <input
              type="text"
              value={formData.order_number}
              onChange={(e) => handleFieldChange('order_number', e.target.value)}
              className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
            />
          </div>

          {/* Order Tracking Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Tracking Number
            </label>
            <input
              type="text"
              value={formData.order_tracking_number || ''}
              onChange={(e) => handleFieldChange('order_tracking_number', e.target.value)}
              className="h-11 px-3 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
            />
          </div>

          {/* Divider */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="h-px bg-gray-200" />
            <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
              Dates
            </h3>
          </div>

          {/* Order Received On */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Received On
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.order_received_on}
                onChange={(e) => handleFieldChange('order_received_on', e.target.value)}
                placeholder="DD MMM YYYY"
                className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          {/* Order Created On */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Created On
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.order_created_on}
                onChange={(e) => handleFieldChange('order_created_on', e.target.value)}
                placeholder="DD MMM YYYY"
                className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          {/* Order Approved On */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Approved On
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.order_approved_on || ''}
                onChange={(e) => handleFieldChange('order_approved_on', e.target.value)}
                placeholder="DD MMM YYYY"
                className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          {/* Order Shipped On */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Shipped On
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.order_shipped_on || ''}
                onChange={(e) => handleFieldChange('order_shipped_on', e.target.value)}
                placeholder="DD MMM YYYY"
                className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          {/* Order Delivered On */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#012d20] pb-1">
              Order Delivered On
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.order_delivered_on || ''}
                onChange={(e) => handleFieldChange('order_delivered_on', e.target.value)}
                placeholder="DD MMM YYYY"
                className="h-11 w-full pl-3 pr-12 py-3 border border-[#919392] rounded-lg bg-white text-sm text-[#012d20] focus:outline-none focus:ring-2 focus:ring-[#007c50] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <CalendarIcon />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Save/Cancel buttons */}
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
  onClose,
  onSave,
  onSaveOrder,
  onCreateOrder
}) => {
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
                <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px] mb-2">
                  Planning
                </h3>
              </div>
              <div className="px-6 pb-4 border-b border-gray-200 flex gap-4">
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

              {/* Orders List Section */}
              <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#012d20] tracking-[-0.25px]">
                  Orders
                </h3>
                <button
                  onClick={() => {
                    // Create new order
                    if (onCreateOrder && request) {
                      const newOrder: Order = {
                        requestId: request.requestId,
                        customer_order_number: '',
                        customer_party_id: '',
                        customer_party_name: '',
                        customer_party_address: '',
                        eap_dossier_number: request.eapDossierNumber || '',
                        eap_dossier_approval_status: 'Pending',
                        eap_dossier_date_of_approval: '',
                        order_reminder_date: '',
                        next_order_expected_date: '',
                        order_number: `ORD-${Date.now()}`,
                        order_status: 'Pending',
                        status_updated_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        order_tracking_number: '',
                        quantity: 0,
                        weeks_ordered: 0,
                        shipment_order_number: '',
                        order_received_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        order_created_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        order_approved_on: '',
                        order_shipped_on: '',
                        order_delivered_on: '',
                        source: 'manual',
                      };
                      onCreateOrder(newOrder);
                      setSelectedOrder(newOrder);
                      setPanelView('order');
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 border border-[#919392] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <AddIcon />
                  <span className="text-sm font-semibold text-[#012d20]">Add order</span>
                </button>
              </div>

              {/* Orders List */}
              <div className="flex flex-col">
                {requestOrders.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    No orders found for this request
                  </div>
                ) : (
                  requestOrders.map((order, index) => {
                    const statusText = order.order_status === 'Delivered' && order.order_delivered_on
                      ? `Delivered ${order.order_delivered_on}`
                      : order.order_status === 'Shipped' && order.order_shipped_on
                        ? `Shipped ${order.order_shipped_on}`
                        : order.order_status === 'Approved' && order.order_approved_on
                          ? `Approved ${order.order_approved_on}`
                          : `Created ${order.order_created_on}`;

                    return (
                      <div
                        key={order.order_number}
                        className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setPanelView('order');
                        }}
                      >
                        <div className="px-4 py-4 flex items-center justify-between">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#012d20] w-5 text-right">{index + 1}.</span>
                              <span className="text-sm text-[#012d20]">{order.quantity} vials</span>
                              <span className="w-1 h-1 rounded-full bg-[#012d20]"></span>
                              <span className="text-sm text-[#012d20]">{order.weeks_ordered} weeks</span>
                            </div>
                            <div className="pl-7 flex items-center gap-2">
                              <span className="text-sm text-[#666967]">{statusText}</span>
                              {order.source === 'kinaxis' && (
                                <span className="inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full bg-[#f3f4f3] text-[11px] text-[#666967]" title="Synced from Kinaxis OMS">
                                  <KinaxisAvatar />
                                  Kinaxis
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // More options menu could go here
                              }}
                              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              <MoreVertIcon />
                            </button>
                            <div className="text-gray-600">
                              <ChevronDownIcon />
                            </div>
                          </div>
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
