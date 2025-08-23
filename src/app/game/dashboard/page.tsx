'use client'
import React, { useState } from 'react';

// Mock data for demonstration
const mockData = [
  { id: 1, name: "Sample Item 1", value: 100, category: "A" },
  { id: 2, name: "Sample Item 2", value: 200, category: "B" },
  { id: 3, name: "Sample Item 3", value: 150, category: "A" },
];

// Section Cards Component
const SectionCards: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Albums</h3>
          <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="text-2xl font-bold">2,847</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Plays</h3>
          <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div className="text-2xl font-bold">45,231</div>
        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Downloads</h3>
          <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>
        <div className="text-2xl font-bold">12,234</div>
        <p className="text-xs text-muted-foreground">+19% from last month</p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Revenue</h3>
          <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.28.6 4.18 1.58 4.18 3.91-.01 1.83-1.38 2.83-3.12 3.16z"/>
          </svg>
        </div>
        <div className="text-2xl font-bold">$15,231</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </div>
    </div>
  );
};

// Chart Area Interactive Component
const ChartAreaInteractive: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Analytics Overview</h3>
        <p className="text-sm text-muted-foreground">Showing data for the last 6 months</p>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg className="h-12 w-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L3.5 15.9z"/>
            </svg>
            <p>Chart will be rendered here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Table Component
const DataTable: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">A list of recent albums and statistics</p>
        </div>
        <div className="p-6 pt-0">
          <div className="overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Value</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{item.name}</td>
                    <td className="p-4 align-middle">{item.value}</td>
                    <td className="p-4 align-middle">{item.category}</td>
                    <td className="p-4 align-middle">
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Albums Page Component
const AlbumsPage: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={mockData} />
        </div>
      </div>
    </div>
  );
};

// Stats Page Component
const StatsPage: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={mockData} />
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'albums' | 'stats'>('albums');

  return (
    <div className="min-h-screen bg-background">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('albums')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'albums'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'albums' ? <AlbumsPage /> : <StatsPage />}
      </div>
    </div>
  );
};

export default DashboardPage;