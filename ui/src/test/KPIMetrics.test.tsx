import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { KPIMetrics } from '@/app/components/KPIMetrics';

// Mock fetch
global.fetch = vi.fn();

describe('KPIMetrics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        totalRevenue: 125000000,
        revenueGrowth: 0.052,
        avgSatisfaction: 4.8,
        tireUnits: 15000,
        inventoryRisk: 12,
        currentMonthLabel: 'December',
      }),
    });
  });

  it('renders loading state initially', () => {
    render(<KPIMetrics />);
    expect(screen.getByText('Loading live metrics...')).toBeInTheDocument();
  });

  it('renders component title', () => {
    render(<KPIMetrics />);
    expect(screen.getByText('Key Metrics Snapshot')).toBeInTheDocument();
  });

  it('fetches and displays KPI data', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    expect(screen.getByText('$125,000,000')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('displays trend indicators correctly', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      // 0.052 * 100 = 5.2, rounded to 5
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    // Should show positive trend (green)
    const positiveTrend = screen.getByText('5%').closest('div');
    expect(positiveTrend).toHaveClass('text-green-600');
  });

  it('displays all five KPI cards', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('Tire Units Sold')).toBeInTheDocument();
    expect(screen.getByText('Inventory Risk')).toBeInTheDocument();
  });

  it('displays alert styling for inventory risk', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      expect(screen.getByText('Inventory Risk')).toBeInTheDocument();
    });

    const alertCard = screen.getByText('Inventory Risk').closest('div');
    expect(alertCard?.parentElement).toHaveClass('border-amber-200');
  });

  it('shows last updated timestamp', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated \d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<KPIMetrics />);

    await waitFor(() => {
      // Should stop showing loading state
      expect(screen.queryByText('Loading live metrics...')).not.toBeInTheDocument();
    });

    // Should still render the component structure
    expect(screen.getByText('Key Metrics Snapshot')).toBeInTheDocument();
  });

  it('makes correct API call', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/kpis');
    });
  });

  it('displays subtitle for customer satisfaction', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      expect(screen.getByText('Out of 5.0')).toBeInTheDocument();
    });
  });

  it('displays current month information', async () => {
    render(<KPIMetrics />);

    await waitFor(() => {
      // Should display "This Month" subtitle somewhere
      expect(screen.getAllByText(/This Month/).length).toBeGreaterThan(0);
    });
  });

  it('handles null values gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalRevenue: null,
        revenueGrowth: null,
        avgSatisfaction: null,
        tireUnits: null,
        inventoryRisk: null,
        currentMonthLabel: null,
      }),
    });

    render(<KPIMetrics />);

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    // Should render with default values
    expect(screen.getByText('$0')).toBeInTheDocument();
    // The em dash character (—) is used for null values
    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThan(0);
  });
});
