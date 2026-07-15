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

  paused: false,
  pendingAdvance: false,

  startTrace: (trace) => set({ trace, traceStep: 0, tracing: true, paused: false, pendingAdvance: false }),
  advanceStep: () => {
    const { trace, traceStep, paused } = get()
    if (paused) { set({ pendingAdvance: true }); return }
    const next = traceStep + 1
    if (next >= trace.hops.length) {
      set({ tracing: false, traceStep: trace.hops.length - 1, pendingAdvance: false })
    } else {
      set({ traceStep: next, pendingAdvance: false })
    }
  },
  togglePause: () => {
    const { paused, pendingAdvance, trace, traceStep } = get()
    if (paused && pendingAdvance) {
      // Resume: fire the advance that was held
      const next = traceStep + 1
      if (next >= trace.hops.length) {
        set({ paused: false, tracing: false, traceStep: trace.hops.length - 1, pendingAdvance: false })
      } else {
        set({ paused: false, traceStep: next, pendingAdvance: false })
      }
    } else {
      set({ paused: !paused })
    }
  },
  resetTrace: () => set({ trace: null, traceStep: -1, tracing: false, paused: false, pendingAdvance: false }),

  // API panel
  apiPanelOpen: false,
  toggleAPIPanel: () => set(s => ({ apiPanelOpen: !s.apiPanelOpen })),
  apiConnected: false,
  apiType: 'mock',
  setAPIConnected: (type) => set({ apiConnected: true, apiType: type, apiPanelOpen: false }),

  // Topology builder
  builderOpen: false,
  toggleBuilder: () => set(s => ({ builderOpen: !s.builderOpen })),
}))
