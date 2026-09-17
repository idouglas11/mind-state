// Shared placeholder for components referenced by the pages but not present
// in the "25 files" PDF export (Base44 only exported the files listed in the
// PDF's file panel; these weren't among them). Re-create them in Base44 and
// re-export, or build your own, then delete this file.
export default function MissingFromExport({ name, className = '' }) {
  return (
    <div
      className={`rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-sm text-amber-700 ${className}`}
    >
      <strong>{name}</strong> wasn't included in the PDF export — implement this
      component to restore this part of the UI.
    </div>
  );
}
