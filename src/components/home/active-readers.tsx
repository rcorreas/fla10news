export function ActiveReaders({ totalViews }: { totalViews: number }) {
  // Formata o número para exibição (ex: 1.5K, 2.3M, etc)
  const formatViews = (views: number): string => {
    if (views >= 1_000_000) {
        return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M`;
    }
    if (views >= 1_000) {
        return `${(views / 1_000).toFixed(1).replace('.', ',')}K`;
    }
    return views.toString();
  };

  return <p className="text-2xl font-bold">{formatViews(totalViews)}</p>;
}
