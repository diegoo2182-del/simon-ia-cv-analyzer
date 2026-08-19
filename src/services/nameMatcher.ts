function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface MatchResult {
  filename: string;
  confidence: number;
}

export function matchCVToCandidate(
  candidateName: string,
  cvFilenames: string[],
): MatchResult | null {
  const normName = normalize(candidateName);
  const nameParts = normName.split(' ').filter((p) => p.length > 1);
  if (!nameParts.length) return null;

  let best: MatchResult = { filename: '', confidence: 0 };

  for (const filename of cvFilenames) {
    const base = filename.replace(/\.(pdf|docx?|doc)$/i, '');
    const normFile = normalize(base);
    const fileParts = normFile.split(' ').filter((p) => p.length > 1);

    const matchingParts = nameParts.filter((part) =>
      fileParts.some((fp) => fp === part || fp.startsWith(part) || part.startsWith(fp)),
    );

    const confidence = matchingParts.length / nameParts.length;
    if (confidence > best.confidence) best = { filename, confidence };
  }

  return best.confidence >= 0.5 ? best : null;
}
