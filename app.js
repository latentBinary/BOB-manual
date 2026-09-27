const commands = [
  { suffix: "init", family: "intent", purpose: "Adopt application-owned specifications, configuration, and project tracking." },
  { suffix: "add-feature", family: "intent", purpose: "Propose a connected feature with system and service context." },
  { suffix: "update-feature", family: "intent", purpose: "Revise a feature and the design choices it affects." },
  { suffix: "add-research", family: "intent", purpose: "Add sourced, non-authoritative market research." },
  { suffix: "update-research", family: "intent", purpose: "Update evidence, provenance, confidence, and interpretation." },
  { suffix: "add-science", family: "intent", purpose: "Add uncertainty-aware scientific knowledge and claim boundaries." },
  { suffix: "update-science", family: "intent", purpose: "Revise scientific evidence, uncertainty, and supported claims." },
  { suffix: "update-decision-status", family: "intent", purpose: "Apply an approved transition from your configured decision statuses." },
  { suffix: "status", family: "intent", purpose: "Report durable project state and the exact next action." },
  { suffix: "note", family: "intent", purpose: "Propose a write inside the separate thinking vault only." },
  { suffix: "constitution", family: "lifecycle", purpose: "Create or update the project's governing development principles." },
  { suffix: "specify", family: "lifecycle", purpose: "Create or update an implementation-ready feature specification." },
  { suffix: "clarify", family: "lifecycle", purpose: "Resolve important ambiguities in the current specification." },
  { suffix: "plan", family: "lifecycle", purpose: "Create the technical design and implementation plan." },
  { suffix: "tasks", family: "lifecycle", purpose: "Create dependency-ordered implementation tasks." },
  { suffix: "analyze", family: "lifecycle", purpose: "Check specification, plan, and tasks for inconsistencies." },
  { suffix: "checklist", family: "lifecycle", purpose: "Generate a feature-specific requirements-quality checklist." },
  { suffix: "implement", family: "lifecycle", purpose: "Execute approved work and its validation gates." },
  { suffix: "converge", family: "lifecycle", purpose: "Find and append remaining work after implementation." },
  { suffix: "taskstoissues", family: "lifecycle", purpose: "Convert tasks into dependency-ordered GitHub issues." }
];

let agent = "codex";
let filter = "all";
let query = "";
const prefix = () => agent === "codex" ? "$" : "/";

function renderCommands() {
  const grid = document.querySelector("#command-grid");
  const shown = commands.filter(command => {
    const matchesFamily = filter === "all" || command.family === filter;
    const haystack = `${command.suffix} ${command.purpose}`.toLowerCase();
    return matchesFamily && haystack.includes(query);
  });
  grid.innerHTML = shown.map(command => {
    const full = `${prefix()}bob-${command.suffix}`;
    const family = command.family === "intent" ? "Product intent" : "Development lifecycle";
    return `<article class="command-card" data-family="${command.family}">
      <span class="family">${family}</span>
      <code>${full}</code>
      <p>${command.purpose}</p>
      <button class="card-copy" data-copy="${full}" aria-label="Copy ${full}">⧉</button>
    </article>`;
  }).join("");
  document.querySelector("#no-results").hidden = shown.length !== 0;
}

function updateAgent(nextAgent) {
  agent = nextAgent;
  const isCodex = agent === "codex";
  document.querySelectorAll(".agent-option").forEach(button => {
    const selected = button.dataset.agent === agent;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll("[data-agent-label]").forEach(node => node.textContent = isCodex ? "Codex" : "Claude");
  const terminal = `bob doctor --agent ${agent}\nbob init --agent ${agent}`;
  document.querySelector("#terminal-init").textContent = terminal;
  document.querySelector("#copy-terminal-init").dataset.copy = terminal;
  document.querySelector("#upgrade-refresh").textContent = terminal;
  document.querySelector("#copy-upgrade-refresh").dataset.copy = terminal;
  const diagnostics = `bob --version\nbob doctor --agent ${agent}\nuv --version\ngit --version\ngit status --short\ngit rev-parse --show-toplevel`;
  document.querySelector("#support-diagnostics").textContent = diagnostics;
  document.querySelector("#copy-support-diagnostics").dataset.copy = diagnostics;
  document.querySelector("#agent-init").textContent = `${prefix()}bob-init`;
  document.querySelectorAll("[data-command]").forEach(node => node.textContent = `${prefix()}bob-${node.dataset.command}`);
  renderCommands();
}

document.querySelectorAll(".agent-option").forEach(button => button.addEventListener("click", () => updateAgent(button.dataset.agent)));
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  renderCommands();
}));
document.querySelector("#command-search").addEventListener("input", event => {
  query = event.target.value.trim().toLowerCase();
  renderCommands();
});

let toastTimer;
document.addEventListener("click", async event => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const text = button.dataset.copy;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  const toast = document.querySelector("#toast");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".rail nav a")];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
}, { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.25, 0.6] });
sections.forEach(section => observer.observe(section));

renderCommands();
