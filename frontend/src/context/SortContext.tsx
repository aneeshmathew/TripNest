"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SortDirection, SortOption } from "../types/listing";

const SORT_OPTION_KEY = "sortOption";
const SORT_DIRECTION_KEY = "sortDirection";

interface SortContextValue {
  sortOption: SortOption;
  sortDirection: SortDirection;
  modalOpen: boolean;
  draftOption: SortOption;
  draftDirection: SortDirection;
  openModal: () => void;
  closeModal: () => void;
  setDraftOption: (option: SortOption) => void;
  setDraftDirection: (direction: SortDirection) => void;
  applySort: () => void;
}

const SortContext = createContext<SortContextValue | undefined>(undefined);

function readStoredSortOption(): SortOption {
  if (typeof window === "undefined") return "Price";
  return (localStorage.getItem(SORT_OPTION_KEY) as SortOption) || "Price";
}

function readStoredSortDirection(): SortDirection {
  if (typeof window === "undefined") return "asc";
  return (localStorage.getItem(SORT_DIRECTION_KEY) as SortDirection) || "asc";
}

export function SortProvider({ children }: { children: ReactNode }) {
  const [sortOption, setSortOption] = useState<SortOption>(readStoredSortOption);
  const [sortDirection, setSortDirection] = useState<SortDirection>(readStoredSortDirection);
  const [draftOption, setDraftOption] = useState<SortOption>(sortOption);
  const [draftDirection, setDraftDirection] = useState<SortDirection>(sortDirection);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setDraftOption(sortOption);
    setDraftDirection(sortDirection);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const applySort = () => {
    setSortOption(draftOption);
    setSortDirection(draftDirection);
    localStorage.setItem(SORT_OPTION_KEY, draftOption);
    localStorage.setItem(SORT_DIRECTION_KEY, draftDirection);
    setModalOpen(false);
  };

  return (
    <SortContext.Provider
      value={{
        sortOption,
        sortDirection,
        modalOpen,
        draftOption,
        draftDirection,
        openModal,
        closeModal,
        setDraftOption,
        setDraftDirection,
        applySort
      }}
    >
      {children}
    </SortContext.Provider>
  );
}

export function useSort(): SortContextValue {
  const ctx = useContext(SortContext);
  if (!ctx) {
    throw new Error("useSort must be used within a SortProvider");
  }
  return ctx;
}
