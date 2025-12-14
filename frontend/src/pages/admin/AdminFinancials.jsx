import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminFinancials = () => {
    // Mock Data
    const income = 125000;
    const expense = 45000;
    const profit = income - expense;

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Income',
                data: [12000, 19000, 15000, 22000, 28000, 32000],
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue
            },
            {
                label: 'Expenses',
                data: [8000, 12000, 10000, 15000, 18000, 20000],
                backgroundColor: 'rgba(239, 68, 68, 0.5)', // Red
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Income vs Expense (Last 6 Months)',
            },
        },
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Financial Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-green-600"/></div>
                        <span className="text-green-500 text-sm font-bold flex items-center gap-1">+12% <TrendingUp className="w-4 h-4"/></span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${income.toLocaleString()}</div>
                    <div className="text-gray-500 text-sm">Total Income</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-red-100 p-3 rounded-lg"><CreditCard className="w-6 h-6 text-red-600"/></div>
                        <span className="text-red-500 text-sm font-bold flex items-center gap-1">+5% <TrendingUp className="w-4 h-4"/></span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${expense.toLocaleString()}</div>
                    <div className="text-gray-500 text-sm">Total Expenses</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-blue-600"/></div>
                        <span className="text-blue-500 text-sm font-bold flex items-center gap-1">+8% <TrendingUp className="w-4 h-4"/></span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${profit.toLocaleString()}</div>
                    <div className="text-gray-500 text-sm">Net Profit</div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <Bar options={options} data={data} />
            </div>
        </div>
    );
};

export default AdminFinancials;
