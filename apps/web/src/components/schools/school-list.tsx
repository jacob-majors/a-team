'use client'

import { useState } from 'react'
import { Search, MapPin, GraduationCap } from 'lucide-react'

export type School = {
  name: string
  address: string
  city: string
  type: 'Middle' | 'High'
}

const SCHOOLS: School[] = [
  // Middle Schools
  { name: 'Cali Calmecac',              address: '9491 Starr Road',           city: 'Windsor',      type: 'Middle' },
  { name: 'Cesar Chavez Language Academy', address: '2480 Sebastopol Road',   city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Comstock Middle School',     address: '2750 West Steele Lane',      city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Lawrence Cook Middle School',address: '2480 Sebastopol Road',       city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Lawrence E. Jones Middle',   address: '5154 Snyder Lane',           city: 'Rohnert Park', type: 'Middle' },
  { name: 'Mark West Charter School',   address: '4600 Lavell Road',           city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Page Academy',               address: '1075 Madrone Avenue',        city: 'Cotati',       type: 'Middle' },
  { name: 'Piner-Olivet Charter',       address: '2707 Francisco Avenue',      city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Rincon Valley Middle',       address: '4650 Badger Road',           city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Roseland Accelerated Middle',address: '1777 West Avenue',           city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Santa Rosa Middle School',   address: '500 E Street',               city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Slater Middle School',       address: '3500 Sonoma Avenue',         city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Spring Lake Middle School',  address: '4675 Mayette Avenue',        city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Technology Middle School',   address: '7165 Burton Avenue',         city: 'Rohnert Park', type: 'Middle' },
  { name: 'Village Charter School',     address: '2590 Piner Road',            city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Willowside Middle School',   address: '5285 Hall Road',             city: 'Santa Rosa',   type: 'Middle' },
  { name: 'Windsor Middle School',      address: '9500 Brooks Road South',     city: 'Windsor',      type: 'Middle' },
  { name: 'Wright Charter School',      address: '4389 Price Avenue',          city: 'Santa Rosa',   type: 'Middle' },
  // High Schools
  { name: 'Cardinal Newman High School',address: '4320 Old Redwood Hwy',       city: 'Santa Rosa',   type: 'High' },
  { name: 'Credo Charter',              address: '1300 Valley House Drive',    city: 'Rohnert Park', type: 'High' },
  { name: 'El Camino Continuation',     address: '5450 Snyder Lane',           city: 'Rohnert Park', type: 'High' },
  { name: 'Elsie Allen High School',    address: '599 Bellevue Avenue',        city: 'Santa Rosa',   type: 'High' },
  { name: 'Healdsburg High School',     address: '1024 Prince Street',         city: 'Healdsburg',   type: 'High' },
  { name: 'Maria Carrillo High School', address: '6975 Montecito Boulevard',   city: 'Santa Rosa',   type: 'High' },
  { name: 'Montgomery High School',     address: '1250 Hahman Drive',          city: 'Santa Rosa',   type: 'High' },
  { name: 'North Bay Met',              address: '8681 Windsor Road',          city: 'Windsor',      type: 'High' },
  { name: 'Northwest Prep',             address: '2590B Piner Road',           city: 'Santa Rosa',   type: 'High' },
  { name: 'Piner High School',          address: '1700 Fulton Road',           city: 'Santa Rosa',   type: 'High' },
  { name: 'Rancho Cotate High School',  address: '5450 Snyder Lane',           city: 'Rohnert Park', type: 'High' },
  { name: 'Ridgeway High School',       address: '325 Ridgway Avenue',         city: 'Santa Rosa',   type: 'High' },
  { name: 'Roseland Collegiate Prep',   address: '100 Sebastopol Road',        city: 'Santa Rosa',   type: 'High' },
  { name: 'Roseland University Prep',   address: '1931 Biwana Drive',          city: 'Santa Rosa',   type: 'High' },
  { name: 'Santa Rosa High School',     address: '1235 Mendocino Avenue',      city: 'Santa Rosa',   type: 'High' },
  { name: 'Technology High School',     address: '550 Bonnie Avenue',          city: 'Rohnert Park', type: 'High' },
  { name: 'Windsor High School',        address: '8695 Windsor Road',          city: 'Windsor',      type: 'High' },
  { name: 'Windsor Oaks Continuation',  address: '8681 Windsor Road',          city: 'Windsor',      type: 'High' },
]

const CITIES = ['All Cities', 'Santa Rosa', 'Windsor', 'Rohnert Park', 'Cotati', 'Healdsburg']

export function SchoolList() {
  const [query, setQuery]   = useState('')
  const [tab, setTab]       = useState<'all' | 'Middle' | 'High'>('all')
  const [city, setCity]     = useState('All Cities')

  const filtered = SCHOOLS.filter(s => {
    if (tab !== 'all' && s.type !== tab) return false
    if (city !== 'All Cities' && s.city !== city) return false
    const q = query.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
  })

  const midCount  = SCHOOLS.filter(s => s.type === 'Middle').length
  const highCount = SCHOOLS.filter(s => s.type === 'High').length

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search schools or cities…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none bg-white"
        />
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-3">
        {([['all', `All (${SCHOOLS.length})`], ['Middle', `Middle (${midCount})`], ['High', `High (${highCount})`]] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              tab === v
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* City filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {CITIES.map(c => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              city === c
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 mb-3">
        Showing {filtered.length} of {SCHOOLS.length} schools
      </p>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No schools match your search.</div>
        ) : (
          filtered.map(school => (
            <a
              key={school.name}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${school.name}, ${school.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-brand-100 hover:bg-brand-50/40 transition-all"
            >
              <div className={`flex-shrink-0 mt-0.5 flex items-center justify-center h-7 w-7 rounded-lg text-white text-xs font-bold ${
                school.type === 'Middle' ? 'bg-brand-500' : 'bg-brand-700'
              }`}>
                {school.type === 'Middle' ? 'M' : 'H'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
                  {school.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400 truncate">{school.city}</span>
                </div>
              </div>
              <span className={`flex-shrink-0 ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                school.type === 'Middle'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-purple-50 text-purple-600'
              }`}>
                {school.type}
              </span>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

export { SCHOOLS }
