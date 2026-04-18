type Review = {
  nota: number;
};

type ReviewStatsResult = {
  totalAvaliacoes: number;
  notaMedia: number;
  notaMediaFormatada: string;
};

function formatarMedia(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

export function calcularReviewStats(reviews: Review[]): ReviewStatsResult {
  if (!reviews || reviews.length === 0) {
    return {
      totalAvaliacoes: 0,
      notaMedia: 0,
      notaMediaFormatada: "0,00",
    };
  }

  const totalAvaliacoes = reviews.length;

  const somaNotas = reviews.reduce((acc, item) => {
    const nota = typeof item.nota === "number" ? item.nota : 0;
    return acc + nota;
  }, 0);

  const mediaBruta = somaNotas / totalAvaliacoes;

  // garante 2 casas decimais igual ao banco
  const notaMedia = Number(mediaBruta.toFixed(2));

  return {
    totalAvaliacoes,
    notaMedia,
    notaMediaFormatada: formatarMedia(notaMedia),
  };
}