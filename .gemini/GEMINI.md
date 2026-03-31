> [!IMPORTANT]
> If you encounter any issues or need detailed clarification, refer to `astro-docs.txt` for the full Astro documentation.

### Project Rules

#### General Rules
* **Commit Guidelines**: Provide a 3-line relevant commit message at the end of every code change.
* **No Comments**: Do not add comments in `.astro` frontmatter, templates, or logic files. 
* **Pure Implementation**: No READMEs, documentation files, or explanatory text within the codebase.
* **Behavior Preservation**: Never change existing behavior or introduce breaking changes unless explicitly instructed.
* **DRY & Lean**: No code duplication. Remove all unused files, functions, variables, and exports.

#### Astro-Specific Architecture
* **Islands Architecture**: Preserve the "Zero JS by default" principle. Use Astro components (`.astro`) for structure and only introduce framework components (`.jsx`, `.vue`, etc.) for necessary client-side interactivity.
* **Server-First Logic**: Prioritize server-side rendering in the component frontmatter. Use Server Islands (`server:defer`) for personalized or slow-loading content to keep the main thread fast.
* **Single Responsibility**: 
    * One Astro component = one UI responsibility.
    * One function = one logic responsibility.
* **Composition Over Inheritance**: Utilize Astro’s `<slot />` and named slots system for component composition rather than complex logic structures.

#### Project Structure & Routing
* **File Scoping**: Keep files small and focused on their specific role within the Astro tree:
    * `src/pages/`: Routing and entry points (Follow file-based routing strictly).
    * `src/components/`: Reusable UI fragments.
    * `src/layouts/`: Reusable page shells and document metadata.
* **Separation of Concerns**: 
    * **Frontmatter (`---`)**: Dedicated to data fetching, prop destructuring, and business logic.
    * **Template**: Dedicated to semantic HTML and Astro expressions.
    * **Styles**: Scoped `<style>` tags within components to prevent global leakage.

#### Naming Conventions
* **Component Naming**: Use **PascalCase** for all component files (e.g., `Header.astro`, `CartButton.jsx`).
* **Route Naming**: Use lowercase for files in `src/pages/`. Use `index.astro` for directory-based routes.
* **Consistency**: Mirror existing project patterns for variable and function names exactly.

#### Code Quality
* **Predictable Flow**: Favor explicit prop passing and Astro constants over global state where possible.
* **Error Handling**: Handle data fetch failures gracefully in the frontmatter using try/catch blocks without adding console logs.
* **Clean Logic**: No console logs or debug statements allowed in the final output.

#### Imports & Exports
* **Frontmatter Management**: Group imports at the top of the component script. Remove all unused imports.
* **Export Control**: Only export constants (like `partial` or `prerender`) that are required by the Astro runtime.
