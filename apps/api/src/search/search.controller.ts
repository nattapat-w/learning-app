import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query("q") q?: string, @Query("limit") limit?: string) {
    const parsed = limit ? Number(limit) : 10;
    const safeLimit =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 25) : 10;
    return this.searchService.search(q ?? "", safeLimit);
  }
}
