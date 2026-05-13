/**
 * Server component that emits a JSON-LD <script> block. Pass either a single
 * schema node or an array — the component drops nulls so callers can be lazy:
 *
 *   <JsonLd data={[organizationSchema(locale), faqSchema(faqs, locale)]} />
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | (Record<string, unknown> | null | undefined)[];
}) {
  const nodes = Array.isArray(data)
    ? data.filter((n): n is Record<string, unknown> => !!n)
    : [data];
  if (nodes.length === 0) return null;
  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Pretty-print is fine here; JSON.stringify with no spaces is also OK
          // but we keep it dense to save bytes.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  );
}
