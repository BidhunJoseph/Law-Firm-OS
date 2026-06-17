export default function OSDocumentsPage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="px-8 sm:px-12 lg:px-16 pt-16 pb-12 max-w-[1800px] mx-auto">
        <header>
          <h1 className="text-4xl md:text-5xl text-[#1D1D1F] font-semibold tracking-tight">Document Vault</h1>
          <p className="text-[#86868B] mt-3 font-medium text-[15px] leading-snug">
            Global view of all matter documents and pending requests.
          </p>
        </header>

        <div className="mt-12 py-32 text-center bg-white/40 rounded-[32px] border border-black/[0.04]">
          <h3 className="text-[#1D1D1F] font-semibold text-xl tracking-tight">Vault Initializing</h3>
          <p className="text-[#86868B] font-medium mt-2">Document requests are managed inside the Deep Matter View for now.</p>
        </div>
      </div>
    </div>
  );
}
