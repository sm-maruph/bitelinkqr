import { useEffect, useState } from 'react'
import { mockStore } from '../services/mockStore'

export default function useMockStore() {
  const [state, setState] = useState(mockStore.getState())
  useEffect(() => mockStore.subscribe(() => setState(mockStore.getState())), [])
  return { state, actions: mockStore }
}
