export type ArticleBlock =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "quote"; text: string; attribution?: string }
  | { id: string; type: "image"; assetId: string; caption?: string };

export type ArticleDocument = {
  version: 1;
  blocks: ArticleBlock[];
};

export function emptyArticleDocument(): ArticleDocument {
  return {
    version: 1,
    blocks: [{ id: crypto.randomUUID(), type: "paragraph", text: "" }],
  };
}

export function parseArticleDocument(value: unknown): ArticleDocument {
  if (
    value &&
    typeof value === "object" &&
    "version" in value &&
    value.version === 1 &&
    "blocks" in value &&
    Array.isArray(value.blocks)
  ) {
    return value as ArticleDocument;
  }

  return emptyArticleDocument();
}
