import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./store";

describe("useStore Rack Mutations", () => {
  beforeEach(() => {
    // Reset state before each test
    useStore.getState().clearRack();
  });

  it("should initialize with an empty rack of size 40", () => {
    const state = useStore.getState();
    expect(state.rack.length).toBe(40);
    expect(state.rack.every((t) => t === null)).toBe(true);
  });

  it("should add a tile to the first empty slot", () => {
    const store = useStore.getState();
    const success = store.addTile({ color: "RED", value: 7 });
    expect(success).toBe(true);

    const updatedState = useStore.getState();
    expect(updatedState.rack[0]).not.toBeNull();
    expect(updatedState.rack[0]?.color).toBe("RED");
    expect(updatedState.rack[0]?.value).toBe(7);
  });

  it("should remove a tile from the slot", () => {
    const store = useStore.getState();
    store.addTile({ color: "BLUE", value: 12 });
    expect(useStore.getState().rack[0]).not.toBeNull();

    store.removeTile(0);
    expect(useStore.getState().rack[0]).toBeNull();
  });

  it("should move a tile to another slot", () => {
    const store = useStore.getState();
    store.addTile({ color: "YELLOW", value: 1 }); // adds to index 0
    expect(useStore.getState().rack[0]?.value).toBe(1);

    store.moveTile(0, 5);
    const updatedState = useStore.getState();
    expect(updatedState.rack[0]).toBeNull();
    expect(updatedState.rack[5]).not.toBeNull();
    expect(updatedState.rack[5]?.value).toBe(1);
  });
});
