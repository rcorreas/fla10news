import { Button } from "@/components/ui/button";
import Link from "next/link";
import { publishDraftAction } from "@/app/admin/materias/actions";

export function PreviewBar({ articleId, slug, editPath }: { articleId: string, slug: string, editPath: string }) {
    return (
        <div className="bg-slate-900 text-white z-50 p-3 flex justify-between items-center shadow-lg relative sticky top-0 w-full mb-4 md:mb-8">
            <div className="text-sm font-bold flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span>
               Visualizando Rascunho / Agendamento
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" asChild>
                    <Link href={editPath}>Editar Erros</Link>
                </Button>
                <form action={publishDraftAction}>
                    <input type="hidden" name="id" value={articleId} />
                    <input type="hidden" name="slug" value={slug} />
                    <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                        Publicar Agora
                    </Button>
                </form>
            </div>
        </div>
    )
}
