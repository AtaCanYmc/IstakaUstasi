import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VisionUpload } from "./VisionUpload";

// Mock Zustand store
vi.mock("../store/store", () => {
  return {
    useStore: vi.fn((selector) => {
      const mockState = {
        user: { email: "test@example.com" },
        token: "mock-token",
        isProcessingVision: false,
        visionError: null,
        uploadImageExtract: vi.fn(),
        uploadImageSolve: vi.fn(),
        t: vi.fn((key) => key),
      };
      return selector ? selector(mockState) : mockState;
    }),
  };
});

describe("VisionUpload Component", () => {
  it("renders the upload area correctly when user is authenticated", () => {
    const { container } = render(<VisionUpload />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
  });
});
