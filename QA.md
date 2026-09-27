# QA baseline

Automated baseline checks are implemented in the repository:

- syntax validation for JavaScript modules;
- neutralization scan for removed customer/product identifiers;
- unit tests for prompt generation, protocol validation and neutral defaults;
- zero-dependency standalone build.

Browser rendering, focus behavior inside a real iframe, CSP integration and a mounted React host remain integration-level checks for the consuming application.
