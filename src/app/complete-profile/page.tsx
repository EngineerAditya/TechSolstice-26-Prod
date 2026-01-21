'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createClient } from "@supabase/supabase-js"

// Supabase client for database operations only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Manipal departments in alphabetical order
const MANIPAL_DEPARTMENTS = ['DLHS', 'DOC', 'MIT', 'MIRM', 'MLS', 'SMI']

const CompleteProfile = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manipal student choice
  const [isUniversityStudent, setIsUniversityStudent] = useState<boolean | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    collegeName: '',
    registrationNumber: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }

    // Pre-fill name from Google OAuth if available
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, fullName: session.user.name || '' }))
    }
  }, [status, session, router])

  // Check if profile already exists and is complete
  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.id) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      // If profile is complete, redirect to profile page
      if (profile && profile.mobile_number && profile.full_name && profile.college_name) {
        router.push('/profile')
      }
    }

    checkProfile()
  }, [session, router])

  // Auto-fill college name when department is selected (if Manipal student)
  useEffect(() => {
    if (isUniversityStudent && selectedDepartment) {
      setFormData(prev => ({ 
        ...prev, 
        collegeName: `MAHE-${selectedDepartment}` 
      }))
    } else if (!isUniversityStudent) {
      setFormData(prev => ({ 
        ...prev, 
        collegeName: '' 
      }))
    }
  }, [isUniversityStudent, selectedDepartment])

  const handleCancel = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate
    if (!formData.fullName || !formData.mobileNumber || !formData.collegeName) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    // Validate mobile number format (10 digits)
    if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      setError('Mobile number must be exactly 10 digits')
      setLoading(false)
      return
    }

    // If Manipal student, validate department selection
    if (isUniversityStudent && !selectedDepartment) {
      setError('Please select a department')
      setLoading(false)
      return
    }

    try {
      if (!session?.user) {
        setError('Not authenticated')
        return
      }

      // Insert profile into database (only after all fields are filled)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: session.user.id,
          email: session.user.email,
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          college_name: formData.collegeName,
          registration_number: formData.registrationNumber || null,
          is_university_student: isUniversityStudent,
        })

      if (insertError) {
        // Check if it's a duplicate mobile number error
        if (insertError.code === '23505') {
          setError('This mobile number is already registered')
        } else {
          setError('Failed to create profile. Please try again.')
        }
        console.error('Profile creation error:', insertError)
        setLoading(false)
        return
      }

      // Success - redirect to profile
      router.push('/profile')
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent px-6 py-12 text-white">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-500">
            Complete Your Profile
          </h1>
          <p className="mt-3 text-base text-gray-400">
            Please provide your details to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">

          {/* Manipal Student Choice */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Are you a MAHE student? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsUniversityStudent(true)
                  setSelectedDepartment('')
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                  isUniversityStudent === true
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                }`}
              >
                Yes, I'm a MAHE Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUniversityStudent(false)
                  setSelectedDepartment('')
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                  isUniversityStudent === false
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                }`}
              >
                No, I'm Not
              </button>
            </div>
          </div>

          {/* Department Selection (only if Manipal student selected) */}
          {isUniversityStudent === true && (
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-300">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select your department</option>
                {MANIPAL_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-300">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10-digit mobile number"
              maxLength={10}
              required
            />
          </div>

          {/* College Name */}
          <div>
            <label htmlFor="collegeName" className="block text-sm font-medium text-gray-300">
              College Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="collegeName"
              value={formData.collegeName}
              onChange={(e) => {
                // If Manipal student, don't allow editing
                if (!isUniversityStudent) {
                  setFormData({ ...formData, collegeName: e.target.value })
                }
              }}
              disabled={isUniversityStudent}
              className={`mt-1 block w-full rounded-lg border border-gray-600 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isUniversityStudent 
                  ? 'bg-gray-700 cursor-not-allowed opacity-75 focus:border-gray-600'
                  : 'bg-gray-800 focus:border-blue-500'
              }`}
              placeholder="College name will auto-fill if MAHE student"
              required
            />
            {isUniversityStudent && (
              <p className="mt-1 text-xs text-gray-500">Auto-filled based on your department</p>
            )}
          </div>

          {/* Registration Number (Optional) */}
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-300">
              Registration Number <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your registration number"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || isUniversityStudent === null}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-base font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-3 text-base font-bold text-white transition-all hover:bg-gray-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile