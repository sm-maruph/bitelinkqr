import { BarChart3, BookOpen, LayoutDashboard, QrCode, ShoppingBag, Table2, Users, WalletCards } from 'lucide-react'

export const restaurants = [
  { id: 'terrace', name: 'The Terrace', initials: 'T', plan: 'Business', outlets: ['Dhanmondi', 'Gulshan'] },
  { id: 'kacchi', name: 'Kacchi Vai', initials: 'K', plan: 'Starter', outlets: ['Dhanmondi'] },
  { id: 'noodle', name: 'Noodle House', initials: 'N', plan: 'Enterprise', outlets: ['Banani', 'Gulshan', 'Uttara'] },
]

export const roles = [
  { id: 'owner', label: 'Restaurant owner', portal: 'admin' },
  { id: 'manager', label: 'Restaurant manager', portal: 'admin' },
  { id: 'outlet', label: 'Outlet manager', portal: 'admin' },
  { id: 'order', label: 'Order staff', portal: 'admin' },
  { id: 'kitchen', label: 'Kitchen staff', portal: 'admin' },
  { id: 'super', label: 'Super admin', portal: 'super' },
  { id: 'customer', label: 'Guest customer', portal: 'customer' },
]

export const navGroups = [
  { label: 'Workspace', links: [['Overview', LayoutDashboard], ['Live orders', ShoppingBag], ['Tables', Table2]] },
  { label: 'Manage', links: [['Menu & offers', BookOpen], ['Payments', WalletCards], ['Team', Users]] },
  { label: 'Understand', links: [['Analytics', BarChart3], ['QR codes', QrCode]] },
]

export const menuItems = [
  { name: 'Smoked Beef Rib', category: 'Kitchen signatures', price: 690, tag: 'Chef pick', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85' },
  { name: 'Tandoori Chicken', category: 'Kitchen signatures', price: 420, tag: 'Popular', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85' },
  { name: 'Crispy Prawn Toast', category: 'Small plates', price: 360, tag: 'New', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=900&q=85' },
  { name: 'Charred Aubergine', category: 'Small plates', price: 280, tag: 'Vegetarian', image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=900&q=85' },
  { name: 'Mango Lassi', category: 'Coolers & drinks', price: 160, tag: 'Fresh', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85' },
  { name: 'Special Mutton Kacchi', category: 'Kacchi', price: 350, tag: 'Signature', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85' },
  { name: 'Chicken Kacchi', category: 'Kacchi', price: 280, tag: 'Popular', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Beef Kacchi', category: 'Kacchi', price: 320, tag: 'Rich', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85' },
  { name: 'Mutton Biryani', category: 'Biryani', price: 330, tag: 'Classic', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Chicken Roast', category: 'Main Course', price: 260, tag: 'Popular', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85' },
  { name: 'Mutton Rezala', category: 'Main Course', price: 390, tag: 'Slow cooked', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=900&q=85' },
  { name: 'Beef Kala Bhuna', category: 'Main Course', price: 340, tag: 'Spiced', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85' },
  { name: 'Plain Polao', category: 'Sides', price: 120, tag: 'Fragrant', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=85' },
  { name: 'Borhani', category: 'Drinks', price: 60, tag: 'House made', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85' },
  { name: 'Coke', category: 'Drinks', price: 50, tag: 'Chilled', image: 'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=85' },
  { name: 'Sprite', category: 'Drinks', price: 50, tag: 'Chilled', image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=900&q=85' },
  { name: 'Mineral Water', category: 'Drinks', price: 30, tag: 'Essential', image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=900&q=85' },
  { name: 'Firni', category: 'Desserts', price: 110, tag: 'Sweet', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=900&q=85' },
  { name: 'Jorda', category: 'Desserts', price: 90, tag: 'Traditional', image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85' },
  { name: 'Shahi Tukra', category: 'Desserts', price: 150, tag: 'Indulgent', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85' },
  { name: 'Aloo Bukhara Chutney', category: 'Sides', price: 45, tag: 'Tangy', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85' },
  { name: 'Cucumber Salad', category: 'Sides', price: 70, tag: 'Fresh', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85' },
  { name: 'Mutton Tehari', category: 'Biryani', price: 290, tag: 'New', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=85' },
  { name: 'Egg Biryani', category: 'Biryani', price: 210, tag: 'Comfort', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85' },
  { name: 'Chicken Tikka', category: 'Main Course', price: 240, tag: 'Charred', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85' },
  { name: 'Dal Tadka', category: 'Sides', price: 130, tag: 'Vegetarian', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85' },
  { name: 'Lemon Mint Cooler', category: 'Drinks', price: 140, tag: 'Refreshing', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85' },
  { name: 'Rabri', category: 'Desserts', price: 130, tag: 'Creamy', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85' },
]

export const orderRows = [
  ['#1048', '06', 'Smoked Beef Rib x 2, Mango Lassi', 'BDT 1,540', 'New', '4 min ago'],
  ['#1047', '03', 'Tandoori Chicken x 1, Mango Lassi x 1', 'BDT 580', 'Preparing', '11 min ago'],
  ['#1046', '11', 'Charred Aubergine x 1', 'BDT 280', 'Ready', '18 min ago'],
  ['#1045', '02', 'Smoked Beef Rib x 1', 'BDT 690', 'Served', '25 min ago'],
]

export const teamMembers = [
  ['SR', 'Samira Rahman', 'samira@theterrace.bd', 'Owner', 'All outlets'],
  ['AH', 'Arif Hossain', 'arif@theterrace.bd', 'Outlet manager', 'Dhanmondi'],
  ['NJ', 'Nusrat Jahan', 'nusrat@theterrace.bd', 'Kitchen staff', 'Dhanmondi'],
  ['RK', 'Rafiq Khan', 'rafiq@theterrace.bd', 'Order staff', 'Dhanmondi'],
]
