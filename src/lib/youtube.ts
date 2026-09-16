export function getYouTubeVideoId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getYouTubeEmbedHtml(url: string | undefined): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `<div class="my-6 aspect-video w-[100%] mx-auto rounded-lg overflow-hidden shadow-md">
    <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>`;
}

export function insertVideoIntoContent(content: string, videoUrl?: string): string {
  const embedHtml = getYouTubeEmbedHtml(videoUrl);
  if (!embedHtml) return content;

  // Se o usuário usou a tag [video], substitui ela
  if (content.toLowerCase().includes('[video]')) {
    return content.replace(/\[video\]/gi, embedHtml);
  }

  // Se não usou a tag, apenas anexa o vídeo no topo do conteúdo
  return embedHtml + '\n\n' + content;
}
