import Link from "next/link";
import WorkForm from "@/components/admin/WorkForm";

export const metadata = { title: "Add project" };

export default function NewWorkPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <Link
          href="/admin/works"
          className="text-xs uppercase tracking-widest text-subtle hover:opacity-60"
        >
          ← Projects
        </Link>
        <h1 className="mt-3 text-3xl font-light tracking-wide">Add project</h1>
        <p className="mt-2 text-sm text-subtle">
          Images come next. For now this creates the project and its details.
        </p>
      </div>

      <WorkForm />
    </div>
  );
}
