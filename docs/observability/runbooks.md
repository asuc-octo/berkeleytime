# Resource dashboard investigation guide

Use this guide with the Grafana dashboard **Berkeleytime — Resources**. Resource
pressure is evidence to investigate, not proof of the cause of an application
problem. The dashboard does not send notifications or change resource limits.

## Start with the source and selected environment

- Select the intended environment, namespace and time range. Namespace/pod
  selections apply to application and container panels; workload selection
  applies to workload comparisons, and node selection applies to node panels.
- Check **Collection targets**. `up=1` means Prometheus reached that scrape
  endpoint; it does not prove every Collector receiver or dependency is healthy.
- Allow approximately 15–60 seconds for export/batching/scraping. Five-minute
  rates need multiple samples and can include activity before a restart.
- **Unknown / No data** means a source or calculation is unavailable. It is not
  equivalent to zero usage, an unlimited container, or a healthy dependency.
- Local Compose supplies application and nginx telemetry. Kubernetes CPU,
  container memory, workload, node and PVC panels require their existing metric
  sources to be configured. Local MongoDB collection is not configured.

## CPU usage and configured allocations

CPU usage is measured in cores: `0.5` means half a CPU core on average over the
five-minute window. Compare usage with GraphQL latency and node pressure during
the same period.

Requests reserve CPU; they are not caps. Exceeding a request does not prove a
container is overloaded. A workload's configured-limit line sums the limits
that exist; it is not a total capacity ceiling if some containers are unlimited.
Inspect the absent-limit tables and individual containers before interpreting it.
The backend intentionally has no CPU limit.

## CPU throttling

The throttling panel shows:

```text
sum of matched throttled-period rates / sum of matched total-period rates
```

Rates cover five minutes. The rules pair counters from the same scrape and
container incarnation before aggregation. Duplicate scrapes of the same cAdvisor
`id` contribute once, using the complete scrape with the largest total-period
rate. Keep `id` on forwarded cAdvisor measurements so restarts remain distinct.
Both stopped and current incarnations can contribute during the selected window.
This is a period-weighted ratio, not an average of instance percentages and not
percent CPU time lost. For example, 3 throttled periods out of 24 total periods
is 12.5%, regardless of how those periods split across a restart.

No complete counter pair or a nonpositive total-period denominator produces no
ratio. A measured zero numerator with positive periods is a valid 0% reading.

Investigate throttling above **10% sustained for five minutes** by comparing
container CPU limits, usage and application latency. Check raw series around
restarts before attributing a spike to the current instance. The threshold is a
starting proposal, not a production SLO or an instruction to change limits.

## Memory and backend responsiveness

- Container working set, process RSS and JavaScript heap are different measures.
  Compare each with its own history rather than expecting them to be equal.
- Investigate working set above **85% of a positive configured memory limit for
  five minutes**. Check whether usage grows steadily and whether Kubernetes
  reports an OOM termination before calling it a memory leak or OOM failure.
- Missing/zero limits do not provide a valid percentage denominator. The
  absent-limit table assumes the state collector exposes the resource-limit
  metric family; an incomplete source cannot establish the actual limit.
- Event-loop max/p99 describe each roughly 15-second collection window, sampled
  at 20 ms resolution. They are not percentiles across the entire displayed hour.
  Investigate p99 above **100 ms for five minutes**, comparing it with GraphQL
  p95, traffic, GC activity and synchronous CPU work.
- High request latency without elevated event-loop delay may warrant checking
  dependencies or network waits. Use application logs/traces where available.

## Redis, MongoDB and nginx

Redis latency covers the instrumented get/set/delete cache operations, not every
Redis command. Compare latency with response-cache hits and misses. A hit ratio
needs positive traffic and both counter families; absent/idle data is not 0% or
100% cache effectiveness.

MongoDB memory is server-reported resident/virtual memory, not container working
set. MongoDB connection categories overlap; nginx active/reading/writing/waiting
categories also overlap. Do not add all categories into a supposed total.

## Storage, nodes and monitoring overhead

Investigate reported filesystem or PVC free space below **15% for five minutes**.
Identify the actual node mount or PVC before considering retention or growth
changes. PVC requested size, reported volume capacity and node filesystem size
are different quantities. Do not substitute node capacity for missing PVC data;
hostPath and some storage drivers expose no volume statistics.

Node pressure conditions describe shared infrastructure. Check the workloads on
that node before attributing pressure to a service. Node-exporter reports Linux
node metrics; in a kind cluster that node is a container in Docker's environment,
not the entire laptop.

Network charts show bytes per second per interface. Interfaces can cover
overlapping traffic; do not blindly sum them or combine host and container
network totals.

Use the monitoring-stack CPU/memory panels to inspect Collector, Prometheus,
Grafana, Loki and Tempo overhead. Compare collection frequency, series counts,
query volume and retention before changing resources.

## Thresholds and missing evidence

Thresholds above are initial investigation proposals. Evaluate sustained windows
manually; the chart's threshold line does not enforce a five-minute hold or send
an alert. Update dashboard descriptions and this guide together when changing
those proposals.

Source metric names/labels, real dashboard rendering, load response and query
performance still need runtime/staging evidence. Passing rule fixtures establish
calculation behavior for those scenarios, not production collection readiness.
