'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { provisionUser } from '@/server/actions/user-actions';
import { Role } from '@prisma/client';
import { Check, ChevronDown, Plus, X, UserPlus, Mail, Key } from 'lucide-react';

export function AddUserDialog({ onUserAdded }: { onUserAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('lawyer');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await provisionUser({ name, email, role, password: tempPassword });
      setOpen(false);
      setName('');
      setEmail('');
      setRole('lawyer');
      setTempPassword('');
      onUserAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to provision user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] text-white rounded-lg text-sm font-semibold hover:bg-[#1557b0] transition-all shadow-md hover:shadow-lg active:scale-95">
          <UserPlus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl md:w-full overflow-hidden">
          
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
            <Dialog.Title className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#1a73e8]" />
              Provision New User
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mt-1">
              Create an account for a new lawyer, paralegal, or administrator. They will be granted immediate access.
            </Dialog.Description>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                <span className="shrink-0">??</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@lawfirm.com"
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Role Assignment
                </label>
                <Select.Root value={role} onValueChange={(val) => setRole(val as Role)}>
                  <Select.Trigger className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-colors">
                    <Select.Value placeholder="Select a role" />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="z-[60] min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95">
                      <Select.Viewport className="p-1">
                        {['admin', 'lawyer', 'paralegal'].map((r) => (
                          <Select.Item
                            key={r}
                            value={r}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-8 pr-2 text-sm outline-none focus:bg-[#1a73e8]/10 focus:text-[#1a73e8] font-medium"
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              <Select.ItemIndicator>
                                <Check className="h-4 w-4" />
                              </Select.ItemIndicator>
                            </span>
                            <Select.ItemText className="capitalize">{r}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <div className="grid gap-2">
                <label htmlFor="tempPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-gray-400" />
                  Initial Password
                </label>
                <div className="relative">
                  <input
                    id="tempPassword"
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Must be changed on first login"
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    They will use this to sign in initially. You should securely communicate this to them.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#1a73e8] text-white rounded-lg text-sm font-semibold hover:bg-[#1557b0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Provisioning...' : 'Provision User'}
              </button>
            </div>
          </form>

          <Dialog.Close className="absolute right-4 top-5 rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-gray-200 transition-all focus:outline-none">
            <X className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
