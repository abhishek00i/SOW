'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/StatCard';
import { RcaAnalysis } from '@/components/RcaAnalysis';
import { TrendAnalysis } from '@/components/TrendAnalysis';
import { LayoutDashboard, AlertTriangle, File, CheckCircle } from 'lucide-react';

interface StatsData {
    avgCompliance: number;
    avgIssues: number;
    totalDocuments: number;
    totalIssues: number;
}

interface AnalysisResult {
    id: string;
    fileName: string;
    date: string;
    issues: any[];
    compliance: number;
    failedCount: number;
    totalChecks: number;
    docHtmlContent: string;
}

export function Dashboard() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const statsResponse = await fetch('http://localhost:8080/api/stats?year=2025');
                const statsData = await statsResponse.json();
                setStats(statsData);

                const analysisResponse = await fetch('http://localhost:8080/api/analysis?year=2025&page=1');
                const analysisData = await analysisResponse.json();
                setHistory(analysisData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statsCards = useMemo(() => {
        if (!stats) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Documents"
                    value={String(stats.totalDocuments)}
                    icon={File}
                    borderColor="border-blue-500"
                    iconColor="text-blue-500"
                />
                <StatCard
                    title="Total Issues"
                    value={String(stats.totalIssues)}
                    icon={AlertTriangle}
                    borderColor="border-red-500"
                    iconColor="text-red-500"
                />
                <StatCard
                    title="Average Compliance"
                    value={`${stats.avgCompliance.toFixed(2)}%`}
                    icon={CheckCircle}
                    borderColor="border-green-500"
                    iconColor="text-green-500"
                />
                <StatCard
                    title="Average Issues per Document"
                    value={stats.avgIssues.toFixed(2)}
                    icon={LayoutDashboard}
                    borderColor="border-yellow-500"
                    iconColor="text-yellow-500"
                />
            </div>
        );
    }, [stats]);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {statsCards && statsCards}

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RcaAnalysis history={history} isLoading={loading} />
                <TrendAnalysis history={history} isLoading={loading} />
            </div>
        </div>
    );
}