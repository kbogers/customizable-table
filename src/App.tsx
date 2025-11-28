import { useMemo } from 'react';
import { Table } from './Table';
import { generateData } from './mockData';
import './index.css';

function App() {
  const data = useMemo(() => generateData(100), []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <a
              href="#"
              className="border-green-600 text-green-800 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm"
            >
              Requests
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Tasks
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Orders
            </a>
          </nav>
        </div>

        <Table data={data} />
      </div>
    </div>
  );
}

export default App;
