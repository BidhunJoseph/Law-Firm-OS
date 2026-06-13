import { FileText, MoreVertical, Star, Users } from "lucide-react";

export default function Home() {
  const recentFiles = [
    { name: "Smith v. Jones - Initial Discovery.pdf", type: "document", date: "Today" },
    { name: "Q3 Corporate Structuring.docx", type: "document", date: "Yesterday" },
    { name: "Doe Estate Planning - Draft 2.pdf", type: "document", date: "Last week" },
    { name: "Acme Corp Merger Agreement.pdf", type: "document", date: "Last week" },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-normal text-gray-800">My Drive</h1>
      </div>

      <div>
        <h2 className="text-[14px] font-medium text-gray-700 mb-4">Suggested</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentFiles.map((file, i) => (
            <div key={i} className="flex flex-col bg-[#f0f4f9] hover:bg-[#e6eef7] cursor-pointer transition-colors rounded-xl p-4 gap-3 border border-transparent hover:border-gray-200">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-blue-600" />
                <button className="p-1 hover:bg-black/5 rounded-full">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="mt-6">
                <p className="text-[14px] font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
                <p className="text-[12px] text-gray-500 mt-0.5">You edited {file.date.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-[14px] font-medium text-gray-700 mb-4 mt-6">Files</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-[13px] font-medium">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Owner</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Last modified</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">File size</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-gray-700">
              {recentFiles.map((file, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-[#f4f7fc] cursor-pointer transition-colors group">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                    <span className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-md">{file.name}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">me</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{file.date}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">2.4 MB</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-black/5 rounded-full"><Star className="h-4 w-4 text-gray-500" /></button>
                      <button className="p-1.5 hover:bg-black/5 rounded-full"><MoreVertical className="h-4 w-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
