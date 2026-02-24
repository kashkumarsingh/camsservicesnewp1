import { redirect } from "next/navigation";

/**
 * Schedule session is merged into Overview (three-column calendar layout).
 * Redirect so old links and bookmarks still work.
 */
export default function ParentSchedulePage() {
  redirect("/dashboard/parent");
}
