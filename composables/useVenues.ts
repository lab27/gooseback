export const useVenues = () => {
  const venueMap = {
    'roda-kvarn': {
      name: 'Röda Kvarn',
      mapLink: 'https://maps.app.goo.gl/EFhGrmoxF3EAiWGA6' // Update with actual Röda Kvarn location
    },
    'fryshusset': {
      name: 'Fryshusset', 
      mapLink: 'https://maps.app.goo.gl/8Yxuihj6JbBckrX96' // Update with actual Fryshusset location
    },
    'vagnhall-16': {
      name: 'Vagnhall 16',
      mapLink: 'https://maps.app.goo.gl/eMQLwjL6KoKjgmWd7' // Update with actual Vagnhall 16 location
    }
  }

  const getVenueName = (slug: string): string => {
    return venueMap[slug as keyof typeof venueMap]?.name || slug
  }

  const getVenueMapLink = (slug: string): string => {
    return venueMap[slug as keyof typeof venueMap]?.mapLink || '#'
  }

  const getVenueData = (slug: string) => {
    return venueMap[slug as keyof typeof venueMap] || { name: slug, mapLink: '#' }
  }

  const getAllVenues = () => {
    return Object.entries(venueMap).map(([slug, data]) => ({
      slug,
      name: data.name,
      mapLink: data.mapLink
    }))
  }

  return {
    getVenueName,
    getVenueMapLink,
    getVenueData,
    getAllVenues,
    venueMap
  }
} 