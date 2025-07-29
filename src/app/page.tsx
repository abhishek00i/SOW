'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AnalysisResult, type Issue } from '@/lib/sow-data';
import {
  AlertTriangle,
  FileText,
  Plus,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  ListChecks,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RcaAnalysis } from '@/components/RcaAnalysis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getYear, getQuarter, getMonth, getWeek, startOfWeek, endOfWeek, format, lastDayOfMonth } from 'date-fns';
import { TrendAnalysis } from '@/components/TrendAnalysis';


// --- IMPORTANT ---
// Replace 'http://YOUR_LOAD_BALANCER_IP' with the actual public IP address of your Google Cloud Load Balancer.
// Use 'http://' and not 'https://' unless you have configured an SSL certificate on your Load Balancer.
const API_BASE_URL = 'http://10.134.65.5';


export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    avgCompliance: 0,
    avgIssues: 0,
    totalIssues: 0,
  });
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalDocuments: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  // Filter and Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedQuarter !== 'all') params.append('quarter', selectedQuarter);
      if (selectedMonth !== 'all') {
        const monthForApi = parseInt(selectedMonth, 10) + 1;
        params.append('month', String(monthForApi));
      }
      if (selectedWeek !== 'all') params.append('week', selectedWeek);
      params.append('page', String(currentPage));

      const statsUrl = `${API_BASE_URL}/api/stats?${params.toString()}`;
      const analysisUrl = `${API_BASE_URL}/api/analysis?${params.toString()}`;

      console.log("DEBUG: Attempting to fetch stats from:", statsUrl);
      console.log("DEBUG: Attempting to fetch analysis data from:", analysisUrl);

      try {
        const [statsResponse, analysisResponse] = await Promise.all([
          fetch(statsUrl),
          fetch(analysisUrl)
        ]);

        if (!statsResponse.ok || !analysisResponse.ok) {
            throw new Error(`Network response was not ok. Stats: ${statsResponse.status}, Analysis: ${analysisResponse.status}`);
        }

        const statsData = await statsResponse.json();
        const analysisData = await analysisResponse.json();

        const transformedData = (analysisData.data || []).map((d: any) => ({
          ...d,
          id: d.file_id 
        }));

        setStats(statsData);
        setHistory(transformedData);
        setPagination(analysisData.pagination || { currentPage: 1, totalPages: 1, totalDocuments: 0 });
        
      } catch (error) {
        console.error('FETCH FAILED: This is likely a CORS or network issue. Check that the backend URL is correct (https://) and the server is running.');
        console.error('Detailed error:', error);
        setStats({ totalDocuments: 0, avgCompliance: 0, avgIssues: 0, totalIssues: 0 });
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedQuarter, selectedMonth, selectedWeek, currentPage]);


  const filterOptions = useMemo(() => {
    // Set the current date context for filtering logic
    const now = new Date('2025-07-29T16:35:00');
    const currentYearVal = getYear(now);
    const currentQuarterVal = getQuarter(now);
    const currentMonthVal = getMonth(now); // 0-indexed (July is 6)
    const currentDateVal = now.getDate();

    // --- Years ---
    const years = [2025, 2024, 2023];

    // --- Quarters ---
    const selectedYearVal = parseInt(selectedYear, 10);
    let quarters: number[] = [1, 2, 3, 4];
    if (selectedYearVal === currentYearVal) {
        quarters = Array.from({ length: currentQuarterVal }, (_, i) => i + 1);
    }

    // --- Months ---
    let months: number[] = [];
    const selectedQuarterVal = parseInt(selectedQuarter, 10);
    if (!isNaN(selectedQuarterVal)) {
        const startMonth = (selectedQuarterVal - 1) * 3;
        const endMonth = startMonth + 2;
        const allMonthsInQuarter = [startMonth, startMonth + 1, startMonth + 2];

        if (selectedYearVal === currentYearVal && selectedQuarterVal === currentQuarterVal) {
            months = allMonthsInQuarter.filter(m => m <= currentMonthVal);
        } else {
            months = allMonthsInQuarter;
        }
    }

    // --- Weeks ---
    let weeks: { label: string; value: string; }[] = [];
    const selectedMonthVal = parseInt(selectedMonth, 10);
    if (!isNaN(selectedMonthVal)) {
        const yearForWeeks = selectedYearVal;
        const monthForWeeks = selectedMonthVal;

        const firstDay = new Date(yearForWeeks, monthForWeeks, 1);
        const lastDay = lastDayOfMonth(firstDay);
        
        const weekSet = new Set<string>();
        let dayIterator = firstDay;

        while(dayIterator <= lastDay) {
            if (selectedYearVal === currentYearVal && monthForWeeks === currentMonthVal && dayIterator.getDate() > currentDateVal) {
                break;
            }
            
            const weekNum = getWeek(dayIterator, { weekStartsOn: 1 });
            const start = startOfWeek(dayIterator, { weekStartsOn: 1 });
            const end = endOfWeek(dayIterator, { weekStartsOn: 1 });
            
            const label = `Week ${weekNum}: ${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
            weekSet.add(JSON.stringify({ label, value: String(weekNum) }));

            dayIterator.setDate(dayIterator.getDate() + 7);
        }
        weeks = Array.from(weekSet).map(str => JSON.parse(str));
    }

    return { years, quarters, months, weeks };
  }, [selectedYear, selectedQuarter, selectedMonth]);


  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedQuarter('all');
    setSelectedMonth('all');
    setSelectedWeek('all');
    setCurrentPage(1);
  };

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter);
    setSelectedMonth('all');
    setSelectedWeek('all');
    setCurrentPage(1);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedWeek('all');
    setCurrentPage(1);
  };

  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
    setCurrentPage(1);
  };
  
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your SOW document compliance and analysis history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/upload">
              <Plus className="mr-2 h-4 w-4" /> New Analysis
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value={isLoading ? '...' : String(stats.totalDocuments)}
          icon={FileText}
          borderColor="border-blue-500"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Avg. Compliance"
          value={isLoading ? '...' : `${Math.round(stats.avgCompliance)}%`}
          icon={LayoutDashboard}
          borderColor="border-green-500"
          iconColor="text-green-500"
        />
        <StatCard
          title="Avg. Issues / Doc"
          value={isLoading ? '...' : stats.avgIssues.toFixed(1)}
          icon={ListChecks}
          borderColor="border-purple-500"
          iconColor="text-purple-500"
        />
        <StatCard
          title="Total Issues Found"
          value={isLoading ? '...' : stats.totalIssues.toString()}
          icon={AlertTriangle}
          borderColor="border-red-500"
          iconColor="text-red-500"
        />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select onValueChange={handleYearChange} value={selectedYear}>
                <SelectTrigger>
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {filterOptions.years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select onValueChange={handleQuarterChange} value={selectedQuarter} disabled={selectedYear === 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    {filterOptions.quarters.map(q => <SelectItem key={q} value={String(q)}>Quarter {q}</SelectItem>)}
                </SelectContent>
            </Select>
            
            <Select onValueChange={handleMonthChange} value={selectedMonth} disabled={selectedQuarter === 'all' || selectedYear === 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {filterOptions.months.map(m => <SelectItem key={m} value={String(m)}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select onValueChange={handleWeekChange} value={selectedWeek} disabled={selectedMonth === 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Weeks</SelectItem>
                    {filterOptions.weeks.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>
      
      <TrendAnalysis history={history} isLoading={isLoading} />
      <RcaAnalysis history={history} isLoading={isLoading} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Analysis History</CardTitle>
           <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={pagination.currentPage <= 1 || isLoading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center">Loading history...</p>
            ) : history.length > 0 ? (
              history.map((doc: AnalysisResult) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedAnalysis(doc)}
                  className="flex w-full items-center justify-between rounded-lg border bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-semibold',
                      doc.compliance >= 80
                        ? 'bg-green-100 text-green-800'
                        : doc.compliance >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    )}
                  >
                    {Math.round(doc.compliance)}% Compliant
                  </Badge>
                </button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No analyses found for the selected filter.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AnalysisResultDialog 
        analysis={selectedAnalysis}
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
      
    </div>
  );
}


interface AnalysisResultDialogProps {
    analysis: AnalysisResult | null;
    isOpen: boolean;
    onClose: () => void;
}

function AnalysisResultDialog({ analysis, isOpen, onClose }: AnalysisResultDialogProps) {
    if (!analysis) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{analysis.fileName}</DialogTitle>
                    <DialogDescription>
                        Analyzed on {new Date(analysis.date).toLocaleString()}. 
                        Found {analysis.failedCount} issue(s) out of {analysis.totalChecks} checks.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4 py-4">
                        {analysis.issues.map((issue: Issue) => (
                            <div key={issue.id} className="p-3 rounded-lg border bg-background">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {issue.status === 'passed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        )}
                                        <span className="font-medium text-sm">{issue.title}</span>
                                    </div>
                                    {issue.status === 'failed' && issue.count && issue.count > 0 && (
                                        <Badge variant="destructive">{issue.count} found</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 pl-8">{issue.description}</p>
                                {issue.status === 'failed' && issue.relevantText && (
                                    <div className='mt-2 pl-8'>
                                        <p className="text-xs text-muted-foreground border-l-2 pl-2 italic">
                                            Relevant text: "{issue.relevantText}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button asChild>
                      <Link href={`/upload?analysisId=${analysis.id}`}>View Full Report</Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
