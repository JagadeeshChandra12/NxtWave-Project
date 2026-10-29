import { load, save, uid } from '../lib/storage'

export function collection<T extends { id: string }>(key: string) {
  return {
    all: (): T[] => load<T[]>(key, []),
    get: (id: string): T | undefined => load<T[]>(key, []).find((x: any) => x.id === id),
    create: (data: any): T => {
      const items = load<T[]>(key, [])
      const item = { ...data, id: data.id || uid(key), createdAt: data.createdAt || new Date().toISOString() } as T
      items.push(item)
      save(key, items)
      return item
    },
    update: (id: string, patch: any): T | undefined => {
      const items = load<T[]>(key, [])
      const idx = items.findIndex((x: any) => x.id === id)
      if (idx < 0) return undefined
      items[idx] = { ...items[idx], ...patch }
      save(key, items)
      return items[idx]
    },
    remove: (id: string) => {
      const items = load<T[]>(key, []).filter((x: any) => x.id !== id)
      save(key, items)
    },
    set: (items: T[]) => save(key, items),
  }
}
