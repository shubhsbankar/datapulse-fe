'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

interface SqlResultsProps {
  results: { headers: string[], rows: any[][], error: string } | null;
}

export function SqlResults({ results }: SqlResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);
  console.log("Query result", results);
  if (!results || results.error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <Tabs defaultValue="results">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="results">Query Results</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="text-center text-gray-500 py-8">
              {
                results ?
                  <span className="text-red-500 text-left">{results.error}</span> :
                  "Execute a query to see results here."
              }
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Pagination logic
  const totalItems = results.rows.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentRows = results.rows.slice(startIndex, endIndex);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="results">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="results">Query Results</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {results.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.map((row, rowIndex) => (
                  <tr key={rowIndex + startIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {cell?.toString() || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 