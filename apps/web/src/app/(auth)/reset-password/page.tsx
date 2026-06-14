'use client'

import { useActionState, useEffect, useState } from 'react'
import { resetPassword } from '@/server/actions/auth-login-actions'
import { Shield, Lock, ArrowRight, AlertCircle, KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        {/* Background gradients for premium feel */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/80 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-100/80 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 right-20 w-72 h-72 bg-purple-100/80 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform -rotate-3 transition-transform hover:-rotate-6">
              <KeyRound className="h-8 w-8 text-white rotate-3" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 font-medium px-4">
            For security reasons, you must set a new password on your first login to the portal.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
          <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-12 border border-white/60">
            <form className="space-y-6" action={formAction}>
              {state?.error && (
                <div className="p-4 bg-red-50/80 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800 font-medium leading-relaxed">{state.error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200/80 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200/80 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPending || !password || password !== confirmPassword}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#0f172a] hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="flex items-center gap-2 relative z-10">
                    {isPending ? 'Updating...' : 'Set New Password'}
                    {!isPending && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Protected by enterprise-grade 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
