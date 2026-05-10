import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

function Dashboard({ user, setUser, schoolData }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'schools', schoolData.id, 'teachers'))
      setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      setError('교사 목록을 불러오지 못했습니다.')
    }
    setLoading(false)
  }

  const handleAddTeacher = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!name.trim()) return
    try {
      const existing = teachers.find(t => t.name === name.trim())
      if (existing) {
        setError('이미 등록된 이름입니다.')
        return
      }
      await addDoc(collection(db, 'schools', schoolData.id, 'teachers'), {
        name: name.trim(),
        createdAt: serverTimestamp()
      })
      setSuccess(`${name.trim()} 등록 완료`)
      setName('')
      fetchTeachers()
    } catch (e) {
      setError('등록 실패: ' + e.message)
    }
  }

  const handleDelete = async (id, tname) => {
    if (!window.confirm(`${tname} 교사를 삭제하시겠습니까?`)) return
    await deleteDoc(doc(db, 'schools', schoolData.id, 'teachers', id))
    fetchTeachers()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      padding: '32px 16px'
    }}>
      {/* 헬퍼 버튼 */}
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

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingTop: '24px' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
              CAMPUSNOTICE ADMIN
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e8edf2', marginBottom: '4px' }}>{schoolData.name}</h1>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>학교 관리자 페이지</p>
          </div>
          <button onClick={() => setUser(null)} style={{
            padding: '10px 20px', border: '1px solid #3f4663', borderRadius: '12px',
            background: 'transparent', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontWeight: '500'
          }}>로그아웃</button>
        </div>

        {/* 교사 등록 섹션 */}
        <div style={{ background: '#1a1f3a', border: '1px solid #3f4663', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#e8edf2' }}>👨‍🏫 교사 등록</h2>
          <form onSubmit={handleAddTeacher} style={{ display: 'flex', gap: '10px' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="교사 이름 입력"
              required
              style={{
                flex: 1, padding: '12px 14px', borderRadius: '12px', border: '1px solid #3f4663',
                background: '#252d4a', color: '#e8edf2', fontSize: '14px'
              }}
            />
            <button type="submit" style={{
              padding: '12px 20px', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600'
            }}>등록</button>
          </form>
          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: '500' }}>⚠️ {error}</p>}
          {success && <p style={{ color: '#10b981', fontSize: '12px', marginTop: '10px', fontWeight: '500' }}>✓ {success}</p>}
        </div>

        {/* 교사 목록 섹션 */}
        <div style={{ background: '#1a1f3a', border: '1px solid #3f4663', borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#e8edf2' }}>
            📋 교사 목록 ({teachers.length}명)
          </h2>
          {loading ? (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>불러오는 중...</p>
          ) : teachers.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>등록된 교사가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teachers.map(t => (
                <div key={t.id} style={{
                  padding: '14px 16px', borderRadius: '12px', background: '#252d4a',
                  border: '1px solid #3f4663', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#e8edf2', fontWeight: '500' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                      {t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString('ko-KR') : '-'}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(t.id, t.name)} style={{
                    padding: '6px 12px', fontSize: '12px',
                    background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                    border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                  }}>삭제</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard