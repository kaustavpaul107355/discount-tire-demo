import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import type { MapContainer as MapContainerType } from "react-leaflet";

// Lazy load map components to reduce initial bundle
const MapContainer = lazy(() => import("react-leaflet").then(m => ({ default: m.MapContainer })));
const TileLayer = lazy(() => import("react-leaflet").then(m => ({ default: m.TileLayer })));
const Marker = lazy(() => import("react-leaflet").then(m => ({ default: m.Marker })));
const Popup = lazy(() => import("react-leaflet").then(m => ({ default: m.Popup })));

// Lazy load leaflet and CSS
let leafletModule: typeof import("leaflet") | null = null;
const loadLeaflet = async () => {
  if (!leafletModule) {
    const L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    const [markerIcon2x, markerIcon, markerShadow] = await Promise.all([
      import("leaflet/dist/images/marker-icon-2x.png"),
      import("leaflet/dist/images/marker-icon.png"),
      import("leaflet/dist/images/marker-shadow.png"),
    ]);
    L.default.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.default,
      iconUrl: markerIcon.default,
      shadowUrl: markerShadow.default,
    });
    leafletModule = L.default;
  }
  return leafletModule;
};

type StoreLocation = {
  store_id: string;
  store_name: string;
  store_region: string;
  state: string;
  revenue: string;
  units: string;
  latitude: string;
  longitude: string;
};

const jitterForStore = (storeId: string) => {
  let hash = 0;
  for (let i = 0; i < storeId.length; i += 1) {
    hash = (hash << 5) - hash + storeId.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  const offset = (normalized - 0.5) * 0.5;
  return offset;
};

export function MapView() {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    loadLeaflet().then(() => setMapReady(true));
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetch("/api/dashboard/map")
      .then((response) => response.json())
      .then((payload) => {
        if (!mounted) {
          return;
        }
        const rows = (payload.locations || []) as StoreLocation[];
        setLocations(rows);
        setLastUpdated(new Date());
        setIsLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const markers = useMemo(
    () =>
      locations
        .map((location) => ({
          ...location,
          lat: Number(location.latitude) + jitterForStore(`${location.store_id}-lat`),
          lng: Number(location.longitude) + jitterForStore(`${location.store_id}-lng`),
          revenueValue: Number(location.revenue || 0),
          unitsValue: Number(location.units || 0),
        }))
        .filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng)),
    [locations]
  );

  const stats = useMemo(() => {
    const totalStores = markers.length;
    const totalRevenue = markers.reduce((sum, row) => sum + (row.revenueValue || 0), 0);
    const totalUnits = markers.reduce((sum, row) => sum + (row.unitsValue || 0), 0);
    const avgRevenue = totalStores ? totalRevenue / totalStores : 0;
    const avgUnits = totalStores ? totalUnits / totalStores : 0;
    const revenuePerUnit = totalUnits ? totalRevenue / totalUnits : 0;
    const topRevenueStore = [...markers].sort((a, b) => b.revenueValue - a.revenueValue)[0];
    const topUnitsStore = [...markers].sort((a, b) => b.unitsValue - a.unitsValue)[0];
    const bottomRevenueStore = [...markers].sort((a, b) => a.revenueValue - b.revenueValue)[0];
    const bottomUnitsStore = [...markers].sort((a, b) => a.unitsValue - b.unitsValue)[0];

    const revenueByState = markers.reduce<Record<string, number>>((acc, row) => {
      const key = row.state || "Unknown";
      acc[key] = (acc[key] || 0) + (row.revenueValue || 0);
      return acc;
    }, {});
    const revenueByRegion = markers.reduce<Record<string, number>>((acc, row) => {
      const key = row.store_region || "Unknown";
      acc[key] = (acc[key] || 0) + (row.revenueValue || 0);
      return acc;
    }, {});
    const unitsByState = markers.reduce<Record<string, number>>((acc, row) => {
      const key = row.state || "Unknown";
      acc[key] = (acc[key] || 0) + (row.unitsValue || 0);
      return acc;
    }, {});
    const unitsByRegion = markers.reduce<Record<string, number>>((acc, row) => {
      const key = row.store_region || "Unknown";
      acc[key] = (acc[key] || 0) + (row.unitsValue || 0);
      return acc;
    }, {});

    const topState = Object.entries(revenueByState).sort((a, b) => b[1] - a[1])[0];
    const topRegion = Object.entries(revenueByRegion).sort((a, b) => b[1] - a[1])[0];
    const topStateUnits = Object.entries(unitsByState).sort((a, b) => b[1] - a[1])[0];
    const topRegionUnits = Object.entries(unitsByRegion).sort((a, b) => b[1] - a[1])[0];
    
    const totalStates = Object.keys(revenueByState).length;
    const totalRegions = Object.keys(revenueByRegion).length;
    const avgRevenuePerState = totalStates ? totalRevenue / totalStates : 0;
    const avgRevenuePerRegion = totalRegions ? totalRevenue / totalRegions : 0;
    
    const highPerformers = markers.filter(m => m.revenueValue > avgRevenue).length;
    const lowPerformers = markers.filter(m => m.revenueValue < avgRevenue * 0.7).length;
    const medianRevenue = [...markers].sort((a, b) => a.revenueValue - b.revenueValue)[Math.floor(markers.length / 2)]?.revenueValue || 0;

    return [
      { label: "Total Stores", value: totalStores.toLocaleString() },
      { label: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
      { label: "Avg Revenue / Store", value: `$${avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
      { label: "Median Revenue / Store", value: `$${medianRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
      { label: "Total Units", value: totalUnits.toLocaleString() },
      { label: "Avg Units / Store", value: avgUnits.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
      {
        label: "Top Store (Revenue)",
        value: topRevenueStore ? topRevenueStore.store_name : "—",
      },
      {
        label: "Top Store (Units)",
        value: topUnitsStore ? topUnitsStore.store_name : "—",
      },
      {
        label: "Lowest Store (Revenue)",
        value: bottomRevenueStore ? bottomRevenueStore.store_name : "—",
      },
      {
        label: "Lowest Store (Units)",
        value: bottomUnitsStore ? bottomUnitsStore.store_name : "—",
      },
      {
        label: "Top State (Revenue)",
        value: topState ? `${topState[0]} $${topState[1].toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—",
      },
      {
        label: "Top Region (Revenue)",
        value: topRegion ? `${topRegion[0]} $${topRegion[1].toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—",
      },
      {
        label: "Top State (Units)",
        value: topStateUnits ? `${topStateUnits[0]} ${topStateUnits[1].toLocaleString()}` : "—",
      },
      {
        label: "Top Region (Units)",
        value: topRegionUnits ? `${topRegionUnits[0]} ${topRegionUnits[1].toLocaleString()}` : "—",
      },
      {
        label: "Revenue / Unit",
        value: `$${revenuePerUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        label: "Active States",
        value: `${totalStates} states`,
      },
      {
        label: "Active Regions",
        value: `${totalRegions} regions`,
      },
      {
        label: "Avg Revenue / State",
        value: `$${avgRevenuePerState.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      },
      {
        label: "High Performers",
        value: `${highPerformers} stores (>${Math.round(avgRevenue / 1000)}K)`,
      },
      {
        label: "Low Performers",
        value: `${lowPerformers} stores (<${Math.round(avgRevenue * 0.7 / 1000)}K)`,
      },
    ];
  }, [markers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Store Footprint Map</h2>
        <div className="text-xs text-gray-500">
          {isLoading ? "Loading live map..." : lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : ""}
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
        {mapReady ? (
          <Suspense fallback={<div className="h-[520px] w-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">Loading map...</div>}>
            <MapContainer center={[39.5, -98.35]} zoom={4} className="h-[520px] w-full rounded-lg">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markers.map((location) => (
                <Marker
              key={`${location.store_id}-${location.state}`}
              position={[location.lat, location.lng]}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{location.store_name}</div>
                  <div className="text-sm text-gray-600">
                    {location.store_region} • {location.state}
                  </div>
                  <div className="text-sm text-gray-700">
                    Revenue: ${location.revenueValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-gray-700">Units: {location.unitsValue.toLocaleString()}</div>
                </div>
              </Popup>
            </Marker>
          ))}
            </MapContainer>
          </Suspense>
        ) : (
          <div className="h-[520px] w-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">Initializing map...</div>
        )}
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store-Level Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
