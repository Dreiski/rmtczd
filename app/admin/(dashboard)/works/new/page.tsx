import Link from "next/link";
import WorkForm from "@/components/admin/WorkForm";
import { PageHeader, button } from "@/components/admin/ui";

export const metadata = { title: "Add project" };

export default function NewWorkPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/works" className={button.quiet}>
          ← Projects
        </Link>
      </div>

      <PageHeader
        title="Add project"
        description="Fill in the details and save. You can add images once it exists."
      />

      <WorkForm />
    </div>
  );
}
