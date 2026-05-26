import { useState } from 'react'
import type { Certificate } from '../types'
import { generateHash, generatePublicUrl } from '../utils/hash'

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const stored = localStorage.getItem('certificates')
    return stored ? JSON.parse(stored) : []
  })

  const issueCertificate = (
    userId: string,
    examId: string,
    userName: string,
    examTitle: string,
    score: number,
  ): Certificate => {
    const existing = certificates.find(c => c.userId === userId && c.examId === examId)
    if (existing) return existing

    const hash = generateHash(userId, examId)
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      hash,
      userId,
      examId,
      userName,
      examTitle,
      score,
      issuedAt: new Date().toISOString(),
      publicUrl: generatePublicUrl(hash),
    }

    const updated = [...certificates, cert]
    setCertificates(updated)
    localStorage.setItem('certificates', JSON.stringify(updated))
    return cert
  }

  const getCertificateByHash = (hash: string): Certificate | undefined =>
    certificates.find(c => c.hash === hash)

  const getUserCertificates = (userId: string): Certificate[] =>
    certificates.filter(c => c.userId === userId)

  return { certificates, issueCertificate, getCertificateByHash, getUserCertificates }
}
