import { redirect } from "next/navigation";

/** `/security` has no landing page of its own — send straight to the review queue. */
export default function SecurityIndex() {
  redirect("/security/applications");
}
