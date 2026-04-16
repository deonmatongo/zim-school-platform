/**
 * A no-op Supabase client for local dev (DEV_BYPASS=true).
 * Every query resolves to { data: null/[], error: null } so pages
 * render empty states instead of crashing.
 */

function makeChain(result: { data: any; error: null; count: null }): any {
  const chain: any = {
    ...result,
    // filter / modifier methods — all return the same chain
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    not: () => chain,
    is: () => chain,
    gte: () => chain,
    lte: () => chain,
    gt: () => chain,
    lt: () => chain,
    like: () => chain,
    ilike: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  }
  return chain
}

const listResult = { data: [], error: null, count: null }
const nullResult = { data: null, error: null, count: null }

export function createMockClient() {
  return {
    from: (_table: string) => makeChain(listResult),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      admin: {
        createUser: async () => ({ data: { user: { id: 'dev-user' } }, error: null }),
        deleteUser: async () => ({ data: {}, error: null }),
      },
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: { path: '' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}
