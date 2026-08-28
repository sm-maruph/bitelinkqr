const profiles = {
  terrace: {
    name: 'The Terrace',
    tagline: 'A little more flavour.',
    description: 'Thoughtful plates, lively spices, and a table worth lingering at.',
    phone: '+880 1700 000 000',
    email: 'hello@theterrace.bd',
    address: 'Dhanmondi, Dhaka',
    hours: '11:00 AM – 11:30 PM',
    chefName: 'Chef Arman Rahman',
    offerTitle: 'Save 20% on signature dishes',
    offerDescription: 'Order two selected mains and enjoy the offer automatically at checkout.',
  },
  kacchi: {
    name: 'Kacchi Vai',
    tagline: 'Tradition served generously.',
    description: 'Celebrated kacchi, slow-cooked meats, fragrant rice, and familiar Bangladeshi hospitality.',
    phone: '+880 1800 000 000',
    email: 'hello@kacchivai.bd',
    address: 'Dhanmondi, Dhaka',
    hours: '11:00 AM – 11:30 PM',
    chefName: 'Chef Mahmud Hasan',
    offerTitle: 'Save 20% on signature dishes',
    offerDescription: 'Order two selected mains and enjoy the offer automatically at checkout.',
  },
  noodle: {
    name: 'Noodle House',
    tagline: 'Bowls made for sharing.',
    description: 'Fresh noodles, bright broths, wok-fired favourites, and warm service throughout the day.',
    phone: '+880 1900 000 000',
    email: 'hello@noodlehouse.bd',
    address: 'Banani, Dhaka',
    hours: '11:00 AM – 11:30 PM',
    chefName: 'Chef Nabila Chowdhury',
    offerTitle: 'Save 20% on signature dishes',
    offerDescription: 'Order two selected mains and enjoy the offer automatically at checkout.',
  },
}

export function getRestaurantContent(restaurantId, outlet) {
  const profile = profiles[restaurantId] || profiles.terrace
  return { ...profile, outlet, address: `${outlet}, Dhaka` }
}
