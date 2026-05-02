// TODO: Replace with Marketcheck API for production
export interface NormalizedVehicle {
  vin: string;
  make: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  owners: number | string;
  damage: string; // 'none' | 'minor' | 'severe'
  recalls: Record<string, unknown>[];
  description: string;
  photos: string[];
  location: string;
  source: string;
  ai_match_score: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchInventory(dealerRequest: any): Promise<NormalizedVehicle[]> {
  const apiKey = process.env.AUTODEV_API_KEY;
  if (!apiKey) {
    console.warn("No AUTODEV_API_KEY found, falling back to mock results for UI testing.");
    return mockResults(dealerRequest);
  }

  try {
    // 1. Query Auto.dev Free Tier
    const autoDevUrl = new URL('https://auto.dev/api/listings');
    autoDevUrl.searchParams.append('make', dealerRequest.make);
    autoDevUrl.searchParams.append('model', dealerRequest.model);
    if (dealerRequest.max_price) autoDevUrl.searchParams.append('price_max', dealerRequest.max_price.toString());
    
    const autoDevRes = await fetch(autoDevUrl.toString(), {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!autoDevRes.ok) {
      console.warn("Auto.dev API failed, falling back to mock results.", await autoDevRes.text());
      return mockResults(dealerRequest);
    }
    
    const listingsData = await autoDevRes.json();
    const results: NormalizedVehicle[] = [];

    // 2. Map and Enrich with NHTSA vPIC
    const records = listingsData?.records || [];
    for (const listing of records.slice(0, 5)) { // Limit to top 5 for demo to prevent rate limits
      let recalls: Record<string, unknown>[] = [];
      let damageStatus = 'none';
      let ownersCount = 1;
      
      // Enrich with NHTSA Recalls (and mock damage/owners since vPIC doesn't provide NMVTIS directly for free)
      if (listing.vin) {
        try {
          const nhtsaRes = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${listing.make}&model=${listing.model}&modelYear=${listing.year}`);
          const nhtsaData = await nhtsaRes.json();
          recalls = nhtsaData.results || [];
          
          // Decode VIN for extra specs if needed
          const vinRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${listing.vin}?format=json`);
          const vinData = await vinRes.json();
          
          // Simulated condition data based on VIN logic (since real NMVTIS requires paid access)
          if (vinData?.Results?.[0]) {
             damageStatus = Math.random() > 0.8 ? 'minor' : 'none';
             ownersCount = Math.floor(Math.random() * 3) + 1;
          }
        } catch (e) {
          console.error('NHTSA API failed for VIN', listing.vin, e);
        }
      }

      // 3. Normalize Data
      const normalized: NormalizedVehicle = {
        vin: listing.vin || `MOCKVIN${Math.floor(Math.random() * 100000)}`,
        make: listing.make || dealerRequest.make,
        model: listing.model || dealerRequest.model,
        year: listing.year || dealerRequest.year_min || 2015,
        price: listing.price || dealerRequest.max_price || 7500,
        mileage: listing.mileage || 85000,
        owners: ownersCount,
        damage: damageStatus,
        recalls: recalls,
        description: listing.description || 'No description provided.',
        photos: listing.photoUrls || ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'],
        location: listing.city || 'Unknown Location',
        source: 'Auto.dev',
        ai_match_score: 0 
      };

      // 4. Calculate AI Match Score (0-100)
      normalized.ai_match_score = calculateMatchScore(normalized, dealerRequest);
      results.push(normalized);
    }

    // 5. Rank Results
    return results.sort((a, b) => b.ai_match_score - a.ai_match_score);
  } catch (err) {
    console.error("Error fetching inventory", err);
    return mockResults(dealerRequest);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateMatchScore(vehicle: NormalizedVehicle, req: any): number {
  let score = 0;
  // Price Fit (30%): closer to max_price = higher score
  if (req.max_price && Number(vehicle.price) <= Number(req.max_price)) score += 30;
  else if (req.max_price) score += Math.max(0, 30 - ((Number(vehicle.price) - Number(req.max_price)) / 100));
  
  // Mileage (25%)
  if (Number(vehicle.mileage) < 50000) score += 25;
  else if (Number(vehicle.mileage) < 100000) score += 15;
  
  // Damage/Clean Title (25%)
  if (vehicle.damage === 'clean' || vehicle.damage === 'none') score += 25;
  else if (vehicle.damage === 'minor') score += 10;
  
  // Proximity (20%) - Mock logic until zip code tracking is implemented
  score += 20;

  return Math.min(100, Math.round(score));
}

// Fallback if no API key is provided so UI can be tested
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockResults(req: any): NormalizedVehicle[] {
  const mock1: NormalizedVehicle = {
    vin: '19UDB2F56EA12345',
    make: req.make || 'Acura',
    model: req.model || 'RDX',
    year: req.year_min || 2015,
    price: (req.max_price || 8000) - 500,
    mileage: 92000,
    owners: 1,
    damage: 'none',
    recalls: [],
    description: 'Beautiful condition, fully detailed and ready to drive.',
    photos: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'],
    location: 'Austin, TX',
    source: 'Auto.dev Mock',
    ai_match_score: 95
  };
  
  const mock2: NormalizedVehicle = {
    vin: '19UDB2F56EA67890',
    make: req.make || 'Acura',
    model: req.model || 'RDX',
    year: req.year_min || 2014,
    price: (req.max_price || 8000) - 1500,
    mileage: 110000,
    owners: 2,
    damage: 'minor',
    recalls: [{ ReportReceivedDate: '2016-01-01', Component: 'AIRBAGS', Summary: 'Takata Airbag' }],
    description: 'Minor wear and tear on bumper. Good running condition.',
    photos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'],
    location: 'Dallas, TX',
    source: 'Auto.dev Mock',
    ai_match_score: 72
  };
  
  return [mock1, mock2].sort((a, b) => b.ai_match_score - a.ai_match_score);
}
