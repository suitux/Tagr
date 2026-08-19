<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI Components

**Always build UI out of the Shadcn primitives in `src/components/ui/` — never hand-roll an element one of them already covers.**
Before writing markup, check what is there (`Dialog`, `Card`, `Button`, `Input`, `Label`, `Select`, `Tooltip`,
`ContextMenu`, `DropdownMenu`, `Table`, `Tabs`, `Sheet`, `Popover`, `ScrollArea`, `Badge`, `Skeleton`, `Separator`,
`AlertDialog`, `Checkbox`, `RadioGroup`, `Slider`, `Accordion`, `Calendar`, …). Toasts go through `sonner`, images
through `@/components/ui/image` (a `next/image` wrapper with a fallback).

- A primitive missing from `src/components/ui/` is added with the CLI (`pnpm dlx shadcn@latest add <name>`,
  configured in `components.json`: style `radix-nova`, icons from `lucide-react`), not rewritten by hand.
- Deviate only when the primitive genuinely cannot do the job — e.g. the visually hidden `<input type='file'>` behind
  the cover upload button, which needs to be `sr-only` rather than styled. Leave a comment saying why.
- Compose with the primitive's own props and slots (`Card` + `CardContent`, `Button asChild`, `size`/`variant`)
  instead of re-styling it from scratch; `cn()` from `@/lib/utils` merges any extra classes.
