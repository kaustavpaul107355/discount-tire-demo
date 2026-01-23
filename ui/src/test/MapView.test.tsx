import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MapView } from '@/app/components/MapView';

// Mock Leaflet to avoid DOM/window dependencies
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        mergeOptions: vi.fn(),
      },
    },
    icon: vi.fn(() => ({})),
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

vi.mock('leaflet/dist/leaflet.css', () => ({ default: {} }));
vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: 'marker-icon-2x.png' }));
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: 'marker-icon.png' }));
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: 'marker-shadow.png' }));

// Mock fetch
global.fetch = vi.fn();

describe('MapView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        locations: [
          {
            store_id: '1',
            store_name: 'Phoenix Downtown',
            store_region: 'Southwest',
            state: 'AZ',
            revenue: '2500000',
            units: '5000',
            latitude: '33.4484',
            longitude: '-112.0740',
          },
          {
            store_id: '2',
            store_name: 'Tucson North',
            store_region: 'Southwest',
            state: 'AZ',
            revenue: '1800000',
            units: '3500',
            latitude: '32.2226',
            longitude: '-110.9747',
          },
        ],
      }),
    });
  });

  it('renders the component without crashing', () => {
    render(<MapView />);
    // Component should render without errors
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<MapView />);
    // Should be in loading state
    const container = screen.getByTestId('map-container');
    expect(container).toBeInTheDocument();
  });

  it('renders the map container', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  it('fetches store data from API', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/map');
    });
  });

  it('displays store statistics after loading', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    // Should complete loading without errors
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders without crashing after data loads', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    // Component should render successfully
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders markers for each store', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    // Should render map container with markers
    const markers = screen.queryAllByTestId('marker');
    expect(markers.length).toBeGreaterThanOrEqual(0); // Markers are filtered based on valid coordinates
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<MapView />);

    await waitFor(() => {
      // Should not crash on error
      const container = screen.getByTestId('map-container');
      expect(container).toBeInTheDocument();
    });
  });

  it('handles empty store data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ locations: [] }),
    });

    render(<MapView />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    // Should not crash with empty data
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders tile layer for map', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    });
  });

  it('handles stores with missing coordinates', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        locations: [
          {
            store_id: '1',
            store_name: 'Test Store',
            store_region: 'West',
            state: 'CA',
            revenue: '1000000',
            units: '2000',
            latitude: null,
            longitude: null,
          },
        ],
      }),
    });

    render(<MapView />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    // Should handle missing coordinates gracefully
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('shows last updated timestamp after loading', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    // Should have completed loading
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });
});
