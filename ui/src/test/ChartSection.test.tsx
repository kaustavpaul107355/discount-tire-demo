import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChartSection } from '@/app/components/ChartSection';

// Mock Recharts components to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('ChartSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        revenueTrend: [
          { month: '2025-12-01', revenue: 10000000 },
          { month: '2025-11-01', revenue: 11000000 },
        ],
        topTires: [
          { model: 'Model A', units: 5000 },
          { model: 'Model B', units: 4500 },
        ],
        inventoryHealth: [
          { store: 'Store 1', healthy: 100, low: 20, critical: 5 },
          { store: 'Store 2', healthy: 90, low: 25, critical: 10 },
        ],
        satisfactionByRegion: [
          { region: 'West', score: 4.5 },
          { region: 'East', score: 4.3 },
        ],
      }),
    });
  });

  it('renders loading state initially', () => {
    render(<ChartSection />);
    expect(screen.getByText('Loading live charts...')).toBeInTheDocument();
  });

  it('renders component title', () => {
    render(<ChartSection />);
    expect(screen.getByText('Dynamic Visual Insights')).toBeInTheDocument();
  });

  it('renders all four chart titles', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      expect(screen.getByText('📈 Revenue Trend (Monthly)')).toBeInTheDocument();
    });

    expect(screen.getByText('🛞 Top-Selling Tire Models')).toBeInTheDocument();
    expect(screen.getByText('📦 Inventory Health by Store')).toBeInTheDocument();
    expect(screen.getByText('⭐ Customer Satisfaction by Region')).toBeInTheDocument();
  });

  it('fetches chart data from API', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/charts');
    });

    // Should make 1 API call that returns all chart data
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('renders line chart for revenue data', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts.length).toBe(1);
    });
  });

  it('renders bar charts for other data', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBe(3);
    });
  });

  it('shows last updated timestamp', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated \d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ChartSection />);

    await waitFor(() => {
      // Should handle error without crashing
      expect(screen.queryByText('Loading live charts...')).not.toBeInTheDocument();
    });

    // Should still render component structure
    expect(screen.getByText('Dynamic Visual Insights')).toBeInTheDocument();
  });

  it('handles empty chart data', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        revenueTrend: [],
        topTires: [],
        inventoryHealth: [],
        satisfactionByRegion: [],
      }),
    });

    render(<ChartSection />);

    await waitFor(() => {
      expect(screen.getByText('📈 Revenue Trend (Monthly)')).toBeInTheDocument();
    });

    // Should render charts even with empty data
    expect(screen.getAllByTestId('responsive-container').length).toBe(4);
  });

  it('renders responsive containers for all charts', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      const containers = screen.getAllByTestId('responsive-container');
      expect(containers.length).toBe(4);
    });
  });

  it('includes chart axes and legends', async () => {
    render(<ChartSection />);

    await waitFor(() => {
      const xAxes = screen.getAllByTestId('x-axis');
      const yAxes = screen.getAllByTestId('y-axis');
      const legends = screen.getAllByTestId('legend');

      expect(xAxes.length).toBe(4); // Each chart has one X axis
      expect(yAxes.length).toBe(4); // Each chart has one Y axis
      expect(legends.length).toBe(1); // Only inventory health has a legend
    });
  });

  it('handles missing payload fields gracefully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<ChartSection />);

    await waitFor(() => {
      expect(screen.getByText('Dynamic Visual Insights')).toBeInTheDocument();
    });

    // Should not crash with missing data
    expect(screen.getAllByTestId('responsive-container').length).toBe(4);
  });
});
