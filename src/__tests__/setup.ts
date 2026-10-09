/**
 * Vitest global setup — runs before every test file.
 *
 * Imports @testing-library/jest-dom to extend Vitest's expect with custom DOM
 * matchers: toBeInTheDocument, toHaveTextContent, toBeDisabled, etc.
 */
import '@testing-library/jest-dom';
