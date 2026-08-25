export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVING', 'SERVED', 'COMPLETED', 'CANCELLED', 'REJECTED']
export const PAYMENT_STATUSES = ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED']
export const ROLES = ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'RESTAURANT_MANAGER', 'OUTLET_MANAGER', 'ORDER_STAFF', 'KITCHEN_STAFF']

export const canAccess = (role, area) => {
  const permissions = {
    SUPER_ADMIN: ['all'],
    RESTAURANT_OWNER: ['operations', 'menu', 'payments', 'staff', 'analytics', 'subscription', 'settings'],
    RESTAURANT_MANAGER: ['operations', 'menu', 'payments', 'analytics'],
    OUTLET_MANAGER: ['operations', 'menu', 'payments'],
    ORDER_STAFF: ['operations'],
    KITCHEN_STAFF: ['operations'],
  }
  return permissions[role]?.includes('all') || permissions[role]?.includes(area)
}
