import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Board from "./Board";

// Mock Zustand store
vi.mock("../store/store", () => {
  return {
    useStore: vi.fn((selector) => {
      const mockState = {
        rack: Array(40).fill(null),
        moveTile: vi.fn(),
        removeTile: vi.fn(),
      };
      return selector ? selector(mockState) : mockState;
    }),
  };
});

describe("Board Component", () => {
  it("renders all 40 slots on the board", () => {
    render(<Board />);
    // Check that we render slot numbers 1 to 40
    for (let i = 1; i <= 40; i++) {
      expect(screen.getByText(String(i))).not.toBeNull();
    }
  });
});
