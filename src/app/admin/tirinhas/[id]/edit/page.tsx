import { getTirinhaById } from "@/data/tirinhas";
import { notFound } from "next/navigation";
import { EditTirinhaForm } from "./edit-form";

export default async function EditTirinhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tirinha = await getTirinhaById(id);

  if (!tirinha) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <EditTirinhaForm tirinha={tirinha} />
    </div>
  );
}
