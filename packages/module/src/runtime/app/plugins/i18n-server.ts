export function createServerGetter<T extends object, Args extends unknown[]>(
  target: WeakRef<T>,
  resolve: (instance: T, ...args: Args) => string | undefined,
  ...args: Args
): () => string | undefined {
  // This scope only holds the weak reference, never the plugin's Nuxt app or i18n instance.
  return () => {
    const instance = target.deref()
    return instance ? resolve(instance, ...args) : undefined
  }
}
