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

export function insertVideoIntoContent(content: string, videoUrl?: string, videoUrl2?: string, videoUrl3?: string): string {
  let newContent = content;

  if (videoUrl2) {
      const embedHtml2 = getYouTubeEmbedHtml(videoUrl2);
      if (embedHtml2 && newContent.toLowerCase().includes('[video2]')) {
          newContent = newContent.replace(/\[video2\]/gi, `\n\n${embedHtml2}\n\n`);
      }
  }

  if (videoUrl3) {
      const embedHtml3 = getYouTubeEmbedHtml(videoUrl3);
      if (embedHtml3 && newContent.toLowerCase().includes('[video3]')) {
          newContent = newContent.replace(/\[video3\]/gi, `\n\n${embedHtml3}\n\n`);
      }
  }

  const embedHtml = getYouTubeEmbedHtml(videoUrl);
  if (!embedHtml) return newContent;

  // Se o usuário usou a tag [video], substitui ela
  if (newContent.toLowerCase().includes('[video]')) {
    return newContent.replace(/\[video\]/gi, `\n\n${embedHtml}\n\n`);
  }

  // Se não usou a tag, apenas anexa o vídeo no topo do conteúdo
  return `${embedHtml}\n\n${newContent}`;
}
