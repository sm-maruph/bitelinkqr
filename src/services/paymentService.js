import { mockStore } from './mockStore'
export const paymentService = { list: () => mockStore.getState().payments, submit: (payment) => mockStore.submitPayment(payment), verify: (id, status) => mockStore.verifyPayment(id, status) }
