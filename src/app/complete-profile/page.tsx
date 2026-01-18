'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const CompleteProfile = () => {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    registrationNumber: '',
    collegeName: '',
  })

  // Logic State
  const [loading, setLoading] = useState(false)
  const [isMahe, setIsMahe] = useState(false)
  const [isNamePrefilled, setIsNamePrefilled] = useState(false)

  // 1. Fetch User Info on Mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      // Check University Status
      const isUniversityStudent = user.email?.endsWith('@learner.manipal.edu') || false
      setIsMahe(isUniversityStudent)

      // Fetch existing profile data
      // CHANGED: .maybeSingle() prevents the 406 Error if row is missing
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.full_name) {
        setFormData(prev => ({ ...prev, fullName: profile.full_name }))
        setIsNamePrefilled(true)
      }
    }
    fetchUser()
  }, [router, supabase])

  // 2. Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Strict Input masking for Mobile Number
    if (name === 'mobileNumber') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10)
      setFormData(prev => ({ ...prev, [name]: numbersOnly }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 3. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.fullName.trim()) { alert('Full Name is required'); setLoading(false); return; }
    if (formData.mobileNumber.length !== 10) { alert('Enter valid 10-digit mobile number'); setLoading(false); return; }
    if (!formData.registrationNumber.trim()) { alert('Registration Number is required'); setLoading(false); return; }
    if (!isMahe && !formData.collegeName.trim()) { alert('College Name is required'); setLoading(false); return; }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Recalculate Auth Provider (In case we are inserting a fresh row)
      const provider = user.app_metadata?.provider || 'google'
      const authProvider = provider === 'azure' ? 'microsoft' : provider

      // CHANGED: Used .upsert() instead of .update()
      // This creates the row if it's missing, or updates it if it exists.
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Primary Key matches Auth ID
          email: user.email, // Ensure email is saved if new row
          auth_provider: authProvider,
          is_university_student: isMahe,

          full_name: formData.fullName.trim(),
          mobile_number: formData.mobileNumber,
          registration_number: formData.registrationNumber.trim(),
          college_name: isMahe ? null : formData.collegeName.trim(),
        }, { onConflict: 'id' }) // Prevent duplicates, update existing

      if (error) throw error

      // Success
      router.refresh()
      router.push('/passes')

    } catch (err: any) {
      console.error('Profile save error:', err)
      alert(err.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-6 text-white relative">
      <div className="absolute inset-0 -z-10 bg-transparent" />
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-blue-500">Complete Profile</h1>
        <p className="mb-8 text-gray-400">
          We need a few more details to generate your event pass.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Full Name</label>
            <input
              name="fullName"
              type="text"
              required
              autoFocus={!isNamePrefilled}
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 text-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Aditi Sharma"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">WhatsApp Number</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500">+91</span>
              <input
                name="mobileNumber"
                type="tel"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 pl-14 text-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Registration / Roll Number</label>
            <input
              name="registrationNumber"
              type="text"
              required
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 text-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={isMahe ? "e.g. 230912345" : "e.g. College Roll No."}
            />
          </div>

          {/* College Name (Conditional) */}
          {!isMahe && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="mb-2 block text-sm font-medium text-gray-300">College Name</label>
              <input
                name="collegeName"
                type="text"
                required={!isMahe}
                value={formData.collegeName}
                onChange={handleChange}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 text-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Nitte Institute of Technology"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Finish Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { memo } from 'react';
export default memo(CompleteProfile);