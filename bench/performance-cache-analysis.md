# Site config SSR cache analysis

Date: 12 August 2026

Base commit: `f90d8ae`

Harness: `/home/harlan/pkg/nuxt-seo/bench/performance`

Each experiment used the same Nuxt SEO fixture, dependencies, Node version, and base source. Each run covered SSR, robots, sitemap, and AI ready profiles. The aggregate timing runs showed host drift. Raw function costs and paired allocation changes provide the stronger signal.

## Ranked opportunities

### 1. Cache environment parsing per server instance

Status: retained.

`envSiteConfig(import.meta.env)` ran once per request from the site config Nitro middleware. It scans the complete environment and converts every matching key. The cache now parses the deployment environment when the server instance loads. Each request still reads `runtimeConfig.site` and `runtimeConfig.public.site`.

| Workload | Baseline environment CPU | Baseline environment allocation | Final per request |
|---|---:|---:|---:|
| SSR | 0.149 ms | 28.0 KiB | 0 |
| robots | 0.137 ms | 27.0 KiB | 0 |
| sitemap | 0.100 ms | 27.2 KiB | 0 |
| AI ready | 0.111 ms | 27.3 KiB | 0 |

The supplied SSR profile attributed 0.133 ms and about 38 KiB to this function. The independent local baseline showed the same hotspot. Controlled bundle pairs reduced total allocation by 36.7 KiB for robots and 36.9 KiB for AI ready. The full endpoint benchmark reduced allocation by 36.0 KiB. CPU totals varied with host load, so the report does not credit their larger aggregate changes.

Caller path:

```text
Nitro request
  -> site config init middleware
  -> envSiteConfig(import.meta.env)
```

Invalidation rule: none within an instance. A new worker, process, deployment, or development module reload parses its environment again.

Risks:

* Code that changes `process.env.NUXT_*_SITE_*` after module evaluation now needs a new server instance. Runtime environment mutation is not a deployment override.
* The cached object remains internal. Each request spreads its values into an isolated request stack.
* Deploy time URL and arbitrary site keys were checked against a production bundle. Both reached SSR state after server startup.

### 2. Cache stack ordering after mutations

Status: rejected.

A simple dirty flag failed the behavior test for direct `stack` mutations. A safe version tracked entry identity and priority. It invalidated on `push`, disposal, length changes, order changes, and priority changes.

| Workload | Baseline sort allocation | Safe cache sort allocation | Delta |
|---|---:|---:|---:|
| robots | 3.29 KiB | 1.58 KiB | 1.71 KiB lower |
| sitemap | 4.68 KiB | 4.32 KiB | 0.36 KiB lower |
| AI ready | 1.34 KiB | 1.33 KiB | noise |

The safe version adds an order scan and snapshot allocation. The measured path is too small to justify that state and invalidation surface.

Caller paths:

```text
robots: getPathRobotConfig -> getSiteRobotConfig -> getSiteIndexable -> stack.get -> sort
sitemap: sitemapIndexXmlEventHandler -> useNitroUrlResolvers -> stack.get -> sort
AI ready: getPathRobotConfig -> getSiteRobotConfig -> getSiteIndexable -> stack.get -> sort
```

### 3. Cache resolved request config

Status: rejected.

The experiment cached normalized results by `debug` and `skipNormalize`. It bypassed caching for `resolveRefs`. It cloned returned values and invalidated on `push` and disposal.

| Metric | Base | Experiment | Result |
|---|---:|---:|---:|
| SSR CPU | 4.380 ms | 4.220 ms | within noise |
| SSR allocation | 2,445,267 B | 2,475,816 B | 30,549 B higher |
| Endpoint CPU | 1.250 ms | 1.403 ms | within noise |
| Endpoint allocation | 785,354 B | 781,368 B | 3,986 B lower |

Robots stack reads fell from 4.5 KiB to 2.2 KiB. AI ready stack reads rose from 1.9 KiB to 2.8 KiB. The extra clone offsets the saved normalization. Direct stack mutation also needs a broader revision protocol.

### 4. Cache normalization or repeated `useSiteConfig` calls

Status: rejected.

`normalizeSiteConfig` sampled below 0.02 ms per SSR. Caching resolved reactive values can stale refs. Returning one shared object can retain caller mutations. Copying the value reproduces the allocation problem from experiment 3. Repeated app calls must continue to resolve refs independently.

## Preserved behavior

Behavior tests cover priority updates, disposal, reactive value changes, stack isolation, direct stack mutations, returned value mutations, debug output, and normalization options. Existing SSR tests cover environment precedence. The production bundle check covered deploy time URL and arbitrary environment keys.

## Confidence

96 out of 100. Unit tests, type checks, builds, four raw workload profiles, controlled bundle pairs, and a production deployment override check passed. Aggregate CPU timing remains host sensitive.
