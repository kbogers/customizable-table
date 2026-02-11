import { useState } from 'react';
import { Table } from './Table';
import { OrdersTable } from './OrdersTable';
import { DetailsPanel } from './DetailsPanel';
import { generateData, generateOrders, type Request, type Order } from './mockData';
import './index.css';

type Tab = 'pending' | 'requests' | 'tasks' | 'orders';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('requests');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [initialView, setInitialView] = useState<'request' | 'order'>('request');
  const [initialRequests] = useState<Request[]>(() => generateData(100));
  const [requestsData, setRequestsData] = useState<Request[]>(initialRequests);
  const [ordersData, setOrdersData] = useState<Order[]>(() => generateOrders(initialRequests));

  const handleSaveRequest = (updatedRequest: Request) => {
    setRequestsData(prev => 
      prev.map(req => req.requestId === updatedRequest.requestId ? updatedRequest : req)
    );
  };

  const handleSaveOrder = (updatedOrder: Order) => {
    setOrdersData(prev =>
      prev.map(order => order.order_number === updatedOrder.order_number ? updatedOrder : order)
    );
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrdersData(prev => [...prev, newOrder]);
  };

  const handleOrderClick = (order: Order) => {
    // Find the request for this order
    const request = requestsData.find(req => req.requestId === order.requestId);
    if (request) {
      setSelectedRequest(request);
      setSelectedOrder(order);
      setInitialView('order');
    }
  };

  const handleClosePanel = () => {
    setSelectedRequest(null);
    setSelectedOrder(null);
    setInitialView('request');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'requests', label: 'Requests' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'orders', label: 'Orders' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="w-full">
        {/* Unified navigation bar */}
        <div className="bg-white border-b border-gray-200 flex items-center pr-3">
          {/* Tabs on the left */}
          <nav className="flex items-center flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap h-[60px] px-4 text-lg font-semibold tracking-[-0.25px] transition-colors border-b-[4px] ${
                  activeTab === tab.key
                    ? 'border-green-700 text-green-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          {/* Toolbar portal target - table components render their controls here */}
          <div id="table-toolbar-portal" className="flex items-center gap-2" />
        </div>

        {activeTab === 'pending' && (
          <div className="text-center py-12 text-gray-500">
            Pending tab - Coming soon
          </div>
        )}
        {activeTab === 'requests' && (
          <Table
            data={requestsData}
            onRowClick={(request) => {
              setSelectedRequest(request);
              setSelectedOrder(null);
              setInitialView('request');
            }}
          />
        )}
        {activeTab === 'tasks' && (
          <div className="text-center py-12 text-gray-500">
            Tasks tab - Coming soon
          </div>
        )}
        {activeTab === 'orders' && (
          <OrdersTable data={ordersData} requests={requestsData} onRowClick={handleOrderClick} />
        )}
      </div>

      {/* Details Panel */}
      <DetailsPanel
        request={selectedRequest}
        orders={ordersData}
        initialOrder={selectedOrder}
        initialView={initialView}
        onClose={handleClosePanel}
        onSave={handleSaveRequest}
        onSaveOrder={handleSaveOrder}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}

export default App;
