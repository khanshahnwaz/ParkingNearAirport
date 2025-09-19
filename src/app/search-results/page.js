"use client"

import SearchResultsPage from "@/components/SearchResponse";
import { Suspense } from "react";

export default function searchResponse(){
  return (
    <Suspense>
      <SearchResultsPage/>
    </Suspense>
  )
  ;
}