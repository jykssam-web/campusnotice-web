import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function Login({ setUser, setSchoolData }) {
  const [step, setStep] = useState(1)
  const [schoolId, setSchoolId] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [school, setSchool] = useState(null)

  // ✅ 추가: URL 파라미터에서 자동 로그인 정보 받기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paramSchoolId = params.get('schoolId')
    const paramSchoolName = params.get('schoolName')
    const paramAdminId = params.get('adminId')
    const paramAtptCode = params.get('atptCode')
    const paramSdSchulCode = params.get('sdSchulCode')

    // teacher-web에서 파라미터가 전달되면 자동 로그인
    if (paramSchoolId && paramAdminId) {
      const schoolObj = {
        id: paramSchoolId,
        name: paramSchoolName,
        adminId: paramAdminId,
        atptCode: paramAtptCode,
        sdSchulCode: paramSdSchulCode,
        isActive: true
      }
      setSchool(schoolObj)
      setSchoolData(schoolObj)
      setUser({ role: 'schoolAdmin', school: schoolObj })
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [setUser, setSchoolData])

  const handleSchoolLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const q = query(collection(db, 'schools'), where('schoolId', '==', schoolId))
      const snap = await getDocs(q)
      if (snap.empty) {
        setError('학교 ID가 올바르지 않습니다.')
        setLoading(false)
        return
      }
      const schoolDoc = snap.docs[0].data()
      if (schoolDoc.password !== password) {
        setError('비밀번호가 올바르지 않습니다.')
        setLoading(false)
        return
      }
      if (!schoolDoc.isActive) {
        setError('비활성화된 학교입니다. 관리자에게 문의하세요.')
        setLoading(false)
        return
      }
      setSchool({ id: snap.docs[0].id, ...schoolDoc })
      setSchoolData({ id: snap.docs[0].id, ...schoolDoc })
      setStep(2)
    } catch (e) {
      setError('오류가 발생했습니다.')
    }
    setLoading(false)
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (adminId !== school.adminId) {
        setError('관리자 ID가 올바르지 않습니다.')
        setLoading(false)
        return
      }
      if (adminPassword !== school.password) {
        setError('비밀번호가 올바르지 않습니다.')
        setLoading(false)
        return
      }
      setUser({ role: 'schoolAdmin', school })
    } catch (e) {
      setError('오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <a href="https://review-page-tau.vercel.app/" target="_blank" rel="noopener noreferrer"
          style={{
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '20px',
            fontSize: '12px',
            textDecoration: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
          후기 작성
        </a>
        <a href="https://open.kakao.com/o/sn3DKrsi" target="_blank" rel="noopener noreferrer"
          style={{
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            border: '1px solid #10b981',
            borderRadius: '20px',
            fontSize: '12px',
            textDecoration: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
          Q&A
        </a>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#1a1f3a',
        border: '1px solid #3f4663',
        borderRadius: '24px',
        padding: '48px 32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            borderRadius: '16px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            🏫
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#e8edf2' }}>
            {step === 1 ? 'CampusNotice' : '관리자 인증'}
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            {step === 1 ? '학교 정보로 로그인하세요' : '관리자 정보를 입력하세요'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSchoolLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px', fontWeight: '500' }}>학교 ID</label>
              <input
                value={schoolId}
                onChange={e => setSchoolId(e.target.value)}
                placeholder="school_a"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #3f4663',
                  background: '#252d4a',
                  color: '#e8edf2',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px', fontWeight: '500' }}>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #3f4663',
                  background: '#252d4a',
                  color: '#e8edf2',
                  fontSize: '14px'
                }}
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              {loading ? '확인 중...' : '다음'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px', fontWeight: '500' }}>관리자 ID</label>
              <input
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                placeholder="admin_school_a"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #3f4663',
                  background: '#252d4a',
                  color: '#e8edf2',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px', fontWeight: '500' }}>비밀번호</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #3f4663',
                  background: '#252d4a',
                  color: '#e8edf2',
                  fontSize: '14px'
                }}
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '10px'
            }}>
              {loading ? '확인 중...' : '로그인'}
            </button>
            <button type="button" onClick={() => { setStep(1); setError('') }} style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#9ca3af',
              border: '1px solid #3f4663',
              borderRadius: '12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              이전
            </button>
          </form>
        )}

        <p style={{ fontSize: '11px', color: '#4b5563', textAlign: 'center', marginTop: '32px' }}>
          © 2025 CampusNotice. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Login