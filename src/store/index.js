import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // view mode
  mode: 'god',  // 'god' | 'follow'
  setMode: (mode) => set({ mode }),

  // topology
  topology: null,
  setTopology: (topology) => set({ topology }),

  // active trace
  trace: null,
  traceStep: -1,   // current hop index (-1 = idle)
  tracing: false,

  startTrace: (trace) => set({ trace, traceStep: 0, tracing: true }),
  advanceStep: () => {
    const { trace, traceStep } = get()
    const next = traceStep + 1
    if (next >= trace.hops.length) {
      set({ tracing: false, traceStep: trace.hops.length - 1 })
    } else {
      set({ traceStep: next })
    }
  },
  resetTrace: () => set({ trace: null, traceStep: -1, tracing: false }),

  // API panel
  apiPanelOpen: false,
  toggleAPIPanel: () => set(s => ({ apiPanelOpen: !s.apiPanelOpen })),
  apiConnected: false,
  apiType: 'mock',
  setAPIConnected: (type) => set({ apiConnected: true, apiType: type, apiPanelOpen: false }),
}))
