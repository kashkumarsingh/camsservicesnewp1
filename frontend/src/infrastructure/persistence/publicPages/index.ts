import { ApiPublicPagesRepository } from "./repositories/ApiPublicPagesRepository";
import type { IPublicPagesRepository } from "@/core/application/publicPages/ports/IPublicPagesRepository";

export const publicPagesRepository: IPublicPagesRepository = new ApiPublicPagesRepository();

