import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Server Actions モック
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
