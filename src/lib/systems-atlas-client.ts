import type { SystemsAtlas } from "./systems-atlas";

type AtlasNode = SystemsAtlas["nodes"][number];
type AtlasEdge = SystemsAtlas["edges"][number];
type AtlasSource = AtlasNode["sources"][number];
type Selection = {
  kind: "node" | "edge" | "route" | "region";
  id: string;
} | null;

const stewardshipLabels: Record<string, string> = {
  built: "Built here",
  operated: "Operated here",
  used: "Used here",
  explored: "Explored here",
};

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = "",
  className = "",
) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function initializeSystemsAtlases() {
  document
    .querySelectorAll<HTMLElement>("[data-systems-atlas]")
    .forEach((root) => {
      if (root.dataset.enhanced === "true") return;
      const seed = root.querySelector("[data-atlas-data]");
      if (!seed?.textContent) return;
      const atlas = JSON.parse(seed.textContent) as SystemsAtlas;
      const nodes = new Map(atlas.nodes.map((node) => [node.id, node]));
      const edges = new Map(atlas.edges.map((edge) => [edge.id, edge]));
      const routes = new Map(atlas.routes.map((route) => [route.id, route]));
      const regions = new Map(
        atlas.regions.map((region) => [region.id, region]),
      );
      const svg = root.querySelector<SVGSVGElement>("[data-atlas-canvas]")!;
      const wholeViewBox = svg.getAttribute("viewBox")!;
      const search = root.querySelector<HTMLInputElement>(
        "[data-atlas-search]",
      )!;
      const history = root.querySelector<HTMLInputElement>(
        "[data-atlas-history]",
      )!;
      const regionSelect = root.querySelector<HTMLSelectElement>(
        "[data-region-select]",
      )!;
      const clearSearch = root.querySelector<HTMLButtonElement>(
        "[data-clear-search]",
      )!;
      const inspector = root.querySelector<HTMLElement>(
        "[data-atlas-inspector]",
      )!;
      const heading = root.querySelector<HTMLElement>(
        "[data-inspector-title]",
      )!;
      const kicker = root.querySelector<HTMLElement>(
        "[data-inspector-kicker]",
      )!;
      const metadata = root.querySelector<HTMLElement>(
        "[data-inspector-meta]",
      )!;
      const body = root.querySelector<HTMLElement>("[data-inspector-body]")!;
      const result = root.querySelector<HTMLElement>("[data-atlas-result]")!;
      let selection: Selection = null;
      let activeRoute = "";
      let activeRegion = "";
      let query = "";

      const isHistorical = (node: AtlasNode) => node.lifecycle === "retired";
      const isHistoricalEdge = (edge: AtlasEdge) =>
        edge.kind === "historical" ||
        edge.state === "historical" ||
        isHistorical(nodes.get(edge.from)!) ||
        isHistorical(nodes.get(edge.to)!);
      const relatedEdges = (id: string) =>
        atlas.edges.filter((edge) => edge.from === id || edge.to === id);
      const searchTexts = new Map(
        atlas.nodes.map((node) => [
          node.id,
          [
            node.title,
            node.summary,
            node.kind,
            node.maturity,
            node.region,
            ...node.sources.map((source) => source.title),
            ...relatedEdges(node.id).flatMap((edge) => [
              edge.label,
              edge.summary,
              ...Object.values(edge.interface ?? {}),
            ]),
          ]
            .join(" ")
            .toLocaleLowerCase(),
        ]),
      );

      function sourceList(sources: AtlasSource[]) {
        const list = element("ul", "", "atlas-source-links");
        for (const source of sources) {
          const item = element("li");
          const link = element("a", source.title);
          link.href = source.href;
          item.append(link);
          const qualifier = source.lastVerified
            ? `Project record · source check ${source.lastVerified}`
            : source.collection === "projects"
              ? "Project record"
              : "Working note";
          item.append(element("span", qualifier));
          list.append(item);
        }
        return list;
      }

      function selectButton(
        label: string,
        kind: "node" | "edge",
        id: string,
        chip = false,
      ) {
        const button = element(
          "button",
          label,
          chip ? "atlas-chip-button" : "atlas-text-button",
        );
        button.type = "button";
        button.setAttribute(`data-${kind}-select`, id);
        return button;
      }

      function setHeading(title: string, category: string, detail: string) {
        heading.textContent = title;
        kicker.textContent = category;
        metadata.textContent = detail;
        body.replaceChildren();
      }

      function renderNode(node: AtlasNode) {
        setHeading(
          node.title,
          node.kind,
          `${stewardshipLabels[node.stewardship]} · ${node.lifecycle} · ${node.maturity}`,
        );
        body.append(element("p", node.summary));
        const connections = relatedEdges(node.id).filter(
          (edge) => history.checked || !isHistoricalEdge(edge),
        );
        if (connections.length) {
          body.append(
            element("h3", "Connections", "atlas-inspector-subheading"),
          );
          const options = element("div", "", "atlas-connection-options");
          for (const edge of connections) {
            const other = nodes.get(
              edge.from === node.id ? edge.to : edge.from,
            )!;
            options.append(
              selectButton(
                `${edge.label} · ${other.title}`,
                "edge",
                edge.id,
                true,
              ),
            );
          }
          body.append(options);
        }
        if (node.sources.length || node.links.length) {
          body.append(
            element("h3", "Read the work", "atlas-inspector-subheading"),
          );
          const links = sourceList(node.sources);
          for (const item of node.links) {
            const li = element("li");
            const a = element("a", item.label);
            a.href = item.href;
            li.append(a);
            links.append(li);
          }
          body.append(links);
        }
        const basis = element("details", "", "atlas-basis");
        basis.append(
          element(
            "summary",
            node.basis.kind === "proposal"
              ? "About this working concept"
              : node.basis.kind === "historical"
                ? "Historical basis"
                : "What this account establishes",
          ),
        );
        basis.append(element("p", node.basis.summary));
        body.append(basis);
      }

      function renderEdge(edge: AtlasEdge) {
        setHeading(edge.label, "Connection", `${edge.kind} · ${edge.state}`);
        const endpoints = element("div", "", "atlas-connection-options");
        endpoints.append(
          selectButton(nodes.get(edge.from)!.title, "node", edge.from, true),
        );
        endpoints.append(element("span", "→"));
        endpoints.append(
          selectButton(nodes.get(edge.to)!.title, "node", edge.to, true),
        );
        body.append(endpoints, element("p", edge.summary));
        if (edge.interface) {
          const fields = element("dl", "", "atlas-interface-fields");
          for (const [label, value] of Object.entries(edge.interface)) {
            const row = element("div");
            row.append(element("dt", label), element("dd", value));
            fields.append(row);
          }
          body.append(fields);
        }
        if (edge.sources.length) {
          body.append(
            element(
              "h3",
              "Why this connection exists",
              "atlas-inspector-subheading",
            ),
          );
          body.append(sourceList(edge.sources));
        }
      }

      function renderInspector() {
        if (selection?.kind === "node") {
          renderNode(nodes.get(selection.id)!);
        } else if (selection?.kind === "edge") {
          renderEdge(edges.get(selection.id)!);
        } else if (selection?.kind === "route") {
          const route = routes.get(selection.id)!;
          setHeading(route.question, "Follow a question", route.title);
          body.append(element("p", route.summary));
          const list = element("ol", "", "atlas-route-steps");
          for (const step of route.steps) {
            const li = element("li");
            li.append(
              selectButton(step.title, "node", step.nodeId),
              element("p", step.summary),
            );
            list.append(li);
          }
          body.append(list);
        } else if (selection?.kind === "region") {
          const region = regions.get(selection.id)!;
          setHeading(
            region.title,
            "A closer look",
            "The positions stay the same as you explore.",
          );
          body.append(element("p", region.summary));
          const options = element("div", "", "atlas-connection-options");
          for (const node of atlas.nodes.filter(
            (node) =>
              node.region === region.id &&
              (history.checked || !isHistorical(node)),
          )) {
            options.append(selectButton(node.title, "node", node.id, true));
          }
          body.append(options);
        } else {
          setHeading(
            "A place to start.",
            "The landscape",
            "Built, operated, used, and explored.",
          );
          body.append(
            element(
              "p",
              "Open a system to see what it does and what it connects to. The routes above follow a question across the landscape; each connection leads to its contract or reasoning.",
            ),
          );
          const options = element("div", "", "atlas-connection-options");
          for (const id of ["vuoro", "homelab-analytics", "listening-rooms"]) {
            if (nodes.has(id))
              options.append(
                selectButton(nodes.get(id)!.title, "node", id, true),
              );
          }
          body.append(options);
        }
      }

      function matchingNode(node: AtlasNode) {
        return (
          (history.checked || !isHistorical(node)) &&
          (!activeRegion || node.region === activeRegion) &&
          (!query || searchTexts.get(node.id)!.includes(query))
        );
      }

      function render() {
        const route = routes.get(activeRoute);
        const routeNodes = new Set(route?.nodeIds ?? []);
        const routeEdges = new Set(route?.edgeIds ?? []);
        const matches = atlas.nodes.filter(matchingNode);
        const selectedNode = selection?.kind === "node" ? selection.id : "";
        const selectedEdge =
          selection?.kind === "edge" ? edges.get(selection.id) : undefined;
        const relatedNodeIds = selectedEdge
          ? new Set([selectedEdge.from, selectedEdge.to])
          : new Set<string>();
        root
          .querySelectorAll<
            HTMLElement | SVGElement
          >("[data-atlas-node], [data-atlas-item]")
          .forEach((item) => {
            const id =
              item.getAttribute("data-atlas-node") ??
              item.getAttribute("data-atlas-item")!;
            const node = nodes.get(id)!;
            const inRoute = routeNodes.has(id);
            const isSelected = id === selectedNode || relatedNodeIds.has(id);
            item.setAttribute("data-in-route", String(inRoute));
            item.setAttribute("data-selected", String(isSelected));
            item.setAttribute(
              "data-muted",
              String(
                (Boolean(query) && !matchingNode(node)) ||
                  (Boolean(activeRoute) && !inRoute),
              ),
            );
            const excluded =
              (!history.checked && isHistorical(node)) ||
              (Boolean(activeRegion) && node.region !== activeRegion);
            if (item.hasAttribute("data-atlas-item")) {
              (item as HTMLElement).hidden =
                excluded || (Boolean(query) && !matchingNode(node));
            } else {
              item.setAttribute("visibility", excluded ? "hidden" : "visible");
              item.setAttribute("aria-hidden", String(excluded));
              if (excluded) item.setAttribute("tabindex", "-1");
              else item.removeAttribute("tabindex");
            }
          });
        root
          .querySelectorAll<SVGElement>("[data-atlas-edge]")
          .forEach((item) => {
            const edge = edges.get(item.getAttribute("data-atlas-edge")!)!;
            const a = nodes.get(edge.from)!;
            const b = nodes.get(edge.to)!;
            const excluded =
              (!history.checked && isHistoricalEdge(edge)) ||
              (Boolean(activeRegion) &&
                (a.region !== activeRegion || b.region !== activeRegion));
            const related = Boolean(
              selectedNode &&
              (edge.from === selectedNode || edge.to === selectedNode),
            );
            const inRoute = routeEdges.has(edge.id);
            const isSelected =
              selection?.kind === "edge" && selection.id === edge.id;
            const dimmed =
              Boolean(selection) &&
              !related &&
              !inRoute &&
              !isSelected &&
              selection?.kind !== "region";
            item.setAttribute("data-in-route", String(inRoute));
            item.setAttribute("data-selected", String(isSelected));
            item.setAttribute("data-related", String(related));
            item.setAttribute("data-dimmed", String(dimmed));
            item.setAttribute("visibility", excluded ? "hidden" : "visible");
            item.setAttribute("aria-hidden", String(excluded || dimmed));
            if (excluded || dimmed) item.setAttribute("tabindex", "-1");
            else item.removeAttribute("tabindex");
          });
        root
          .querySelectorAll<SVGElement>("[data-atlas-region]")
          .forEach((region) => {
            region.setAttribute(
              "visibility",
              activeRegion &&
                region.getAttribute("data-atlas-region") !== activeRegion
                ? "hidden"
                : "visible",
            );
          });
        root
          .querySelectorAll<HTMLElement>("[data-index-region]")
          .forEach((region) => {
            region.hidden = !matches.some(
              (node) => node.region === region.dataset.indexRegion,
            );
          });
        root.querySelectorAll<HTMLElement>("[data-route]").forEach((button) => {
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.route === activeRoute),
          );
        });
        root
          .querySelectorAll<HTMLElement>(
            "[data-edge-reference], .atlas-index [data-edge-select]",
          )
          .forEach((item) => {
            const id =
              item.getAttribute("data-edge-reference") ??
              item.getAttribute("data-edge-select")!;
            item.hidden = !history.checked && isHistoricalEdge(edges.get(id)!);
          });
        regionSelect.value = activeRegion;
        if (activeRegion) {
          const region = root.querySelector(
            `[data-atlas-region="${activeRegion}"] rect`,
          )!;
          const x = Number(region.getAttribute("x"));
          const y = Number(region.getAttribute("y"));
          const width = Number(region.getAttribute("width"));
          svg.setAttribute(
            "viewBox",
            `${x - (650 - width) / 2} ${y - 25} 650 400`,
          );
        } else {
          svg.setAttribute("viewBox", wholeViewBox);
        }
        clearSearch.hidden = !query;
        result.textContent = query
          ? matches.length
            ? `${matches.length} ${matches.length === 1 ? "system matches" : "systems match"} “${search.value.trim()}”`
            : `No systems match “${search.value.trim()}”.`
          : activeRegion
            ? `${regions.get(activeRegion)!.title} · ${matches.length} systems`
            : `${matches.length} systems across ${atlas.regions.length} regions${history.checked ? " · history included" : ""}`;
        renderInspector();
      }

      function writeHash(value: Selection) {
        const url = new URL(window.location.href);
        url.hash = value ? `${value.kind}-${value.id}` : "";
        window.history.replaceState(null, "", url);
      }

      function select(next: Selection, updateUrl = true) {
        if (next?.kind === "node") {
          const node = nodes.get(next.id);
          if (!node) return;
          if (isHistorical(node)) history.checked = true;
          if (activeRegion && node.region !== activeRegion)
            activeRegion = node.region;
          if (
            activeRoute &&
            !routes.get(activeRoute)!.nodeIds.includes(node.id)
          )
            activeRoute = "";
        } else if (next?.kind === "edge") {
          const edge = edges.get(next.id);
          if (!edge) return;
          if (isHistoricalEdge(edge)) history.checked = true;
          if (
            activeRegion &&
            (nodes.get(edge.from)!.region !== activeRegion ||
              nodes.get(edge.to)!.region !== activeRegion)
          )
            activeRegion = "";
        } else if (next?.kind === "route") {
          const route = routes.get(next.id);
          if (!route) return;
          activeRoute = route.id;
          activeRegion = "";
          query = "";
          search.value = "";
          if (route.includeHistory) history.checked = true;
        } else if (next?.kind === "region") {
          if (!regions.has(next.id)) return;
          activeRegion = next.id;
          activeRoute = "";
          query = "";
          search.value = "";
        }
        selection = next;
        if (updateUrl) writeHash(next);
        render();
      }

      function readHash() {
        if (!window.location.hash) {
          selection = null;
          activeRegion = "";
          activeRoute = "";
          render();
          return;
        }
        const match = /^#(node|edge|route|region)-([a-z0-9-]+)$/.exec(
          window.location.hash,
        );
        if (!match) return;
        select(
          { kind: match[1] as NonNullable<Selection>["kind"], id: match[2] },
          false,
        );
      }

      root.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;
        const trigger = target.closest<HTMLElement | SVGElement>(
          "[data-atlas-node], [data-node-select], [data-atlas-edge], [data-edge-select], [data-route], [data-region-focus]",
        );
        if (!trigger) return;
        event.preventDefault();
        const nodeId =
          trigger.getAttribute("data-atlas-node") ??
          trigger.getAttribute("data-node-select");
        const edgeId =
          trigger.getAttribute("data-atlas-edge") ??
          trigger.getAttribute("data-edge-select");
        const routeId = trigger.getAttribute("data-route");
        const regionId = trigger.getAttribute("data-region-focus");
        if (nodeId) select({ kind: "node", id: nodeId });
        else if (edgeId) select({ kind: "edge", id: edgeId });
        else if (routeId) select({ kind: "route", id: routeId });
        else if (regionId) select({ kind: "region", id: regionId });
        const inspectorBounds = inspector.getBoundingClientRect();
        if (
          inspectorBounds.top < 96 ||
          inspectorBounds.bottom > window.innerHeight
        ) {
          inspector.scrollIntoView({ block: "start", behavior: "instant" });
        }
      });
      search.addEventListener("input", () => {
        query = search.value.trim().toLocaleLowerCase();
        if (query) {
          activeRegion = "";
          activeRoute = "";
          if (selection?.kind === "region" || selection?.kind === "route") {
            selection = null;
            writeHash(null);
          }
        }
        render();
      });
      clearSearch.addEventListener("click", () => {
        query = "";
        search.value = "";
        render();
        search.focus();
      });
      history.addEventListener("change", () => {
        if (!history.checked) {
          if (activeRoute && routes.get(activeRoute)!.includeHistory)
            activeRoute = "";
          if (
            selection?.kind === "node" &&
            isHistorical(nodes.get(selection.id)!)
          )
            selection = null;
          if (selection?.kind === "edge") {
            const edge = edges.get(selection.id)!;
            if (isHistoricalEdge(edge)) selection = null;
          }
          if (
            selection?.kind === "route" &&
            routes.get(selection.id)!.includeHistory
          )
            selection = null;
          writeHash(selection);
        }
        render();
      });
      regionSelect.addEventListener("change", () => {
        if (regionSelect.value)
          select({ kind: "region", id: regionSelect.value });
        else {
          activeRegion = "";
          select(null);
        }
      });
      root
        .querySelector("[data-atlas-reset]")!
        .addEventListener("click", () => {
          selection = null;
          activeRegion = "";
          activeRoute = "";
          query = "";
          search.value = "";
          history.checked = false;
          writeHash(null);
          render();
        });
      root
        .querySelector("[data-atlas-return]")!
        .addEventListener("click", () => {
          const destination = window.matchMedia("(max-width: 1000px)").matches
            ? root.querySelector(".atlas-index")!
            : root.querySelector(".atlas-map-caption")!;
          destination.scrollIntoView({ block: "start", behavior: "instant" });
        });
      window.addEventListener("hashchange", readHash);
      root.dataset.enhanced = "true";
      readHash();
      render();
    });
}
