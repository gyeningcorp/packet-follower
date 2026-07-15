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
  tracing: false,  // true = live first pass running
  replaying: false, // true = auto-replay in review mode

  startTrace: (trace) => set({ trace, traceStep: 0, tracing: true, replaying: false }),

  // Called by PacketOrb when orb reaches a node during live trace
  advanceStep: () => {
    const { trace, traceStep } = get()
    if (!trace) return
    const next = traceStep + 1
    if (next >= trace.hops.length) {
      set({ tracing: false, traceStep: trace.hops.length - 1 })
    } else {
      set({ traceStep: next })
    }
  },

  // Review playback controls (only active after trace completes)
  stepBack: () => {
    const { traceStep, replaying } = get()
    if (traceStep > 0) set({ traceStep: traceStep - 1, replaying: false })
  },
  stepForward: () => {
    const { trace, traceStep } = get()
    if (!trace) return
    if (traceStep < trace.hops.length - 1) {
      set({ traceStep: traceStep + 1 })
    } else {
      set({ replaying: false }) // stop auto-replay at end
    }
  },
  toggleReplay: () => set(s => ({ replaying: !s.replaying })),

  resetTrace: () => set({ trace: null, traceStep: -1, tracing: false, replaying: false }),

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
